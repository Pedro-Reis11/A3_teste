# TravelLookAI — API de orçamento (Sprints 1 a 4)

Base inicial do backend do módulo de orçamento, usando Node.js, Express e MySQL 8.

## Requisitos

- Node.js 20 ou superior
- MySQL 8.0.16 ou superior
- npm

## 1. Configurar o banco

1. Inicie o MySQL.
2. Execute o arquivo `database/schema.sql` no MySQL Workbench ou CLI:

```bash
mysql -u root -p < database/schema.sql
```

O script cria o banco `travellookai`, uma tabela mínima `viagens`, as tabelas `orcamentos`, `categorias` e `despesas`, além das categorias iniciais.

> Se você já possui uma tabela `viagens` no seu banco real, não execute cegamente o bloco de criação dessa tabela. Confira o tipo da PK e adapte a FK `orcamentos.viagem_id`. Este pacote é uma base independente para a versão simplificada React Native + MySQL.

## 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e informe suas credenciais locais:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite `DB_USER`, `DB_PASSWORD` e os demais valores conforme sua instalação.

## 3. Instalar dependências

```bash
npm install
```

## 4. Verificar a conexão

```bash
npm run db:check
```

Resultado esperado:

```text
OK: conexão com MySQL estabelecida.
```

## 5. Iniciar a API

```bash
npm run dev
```

Endpoints disponíveis nesta sprint:

- `GET http://localhost:3000/` — informações da API
- `GET http://localhost:3000/health` — saúde do servidor
- `GET http://localhost:3000/health/db` — saúde da conexão MySQL

Exemplo de resposta de `/health/db`:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Estrutura

```text
src/
├── config/       # Ambiente e pool MySQL
├── routes/       # Rotas de infraestrutura (health check)
├── app.js        # Configuração Express
└── server.js     # Inicialização e encerramento gracioso

database/
└── schema.sql    # Schema e seed de categorias

scripts/
└── check-database.js
```

## Decisões técnicas

- `mysql2/promise`: API assíncrona compatível com `async/await`.
- Connection pool: reutiliza conexões e limita concorrência.
- `DECIMAL(12,2)`: precisão adequada para valores monetários; evite `FLOAT` para dinheiro.
- UUID em `CHAR(36)`: identificadores gerados pela aplicação, sem depender de função específica do banco.
- Chaves estrangeiras e `CHECK`: integridade referencial e validações também no banco.
- `ON DELETE RESTRICT`: impede apagar orçamento/categoria enquanto houver despesas dependentes.
- `GET /health/db`: verifica conectividade sem expor credenciais ou detalhes internos.

## Sprints 3 e 4 — despesas e dashboard

Além do CRUD de orçamento, a API fornece CRUD de despesas e categorias, filtros paginados e dashboard financeiro.

- `GET|POST /api/v1/categories`
- `PUT|DELETE /api/v1/categories/:categoryId`
- `GET|POST /api/v1/budgets/:budgetId/expenses`
- `GET|PUT|DELETE /api/v1/expenses/:expenseId`
- `GET /api/v1/trips/:tripId/dashboard`

Filtros disponíveis na listagem: `categoriaId`, `dataInicio`, `dataFim`, `page` e `limit`. Consulte o `../README.md` para a tabela completa de endpoints, exemplos e instruções do aplicativo React Native.

Para um banco já criado antes destas sprints, aplique uma vez `database/migrations/001_sprints_3_5.sql`, que cria o índice composto usado nos filtros por categoria.

## Fora do escopo da Sprint 1

CRUDs, autenticação, autorização por usuário, dashboard financeiro e integração React Native serão implementados nas próximas sprints.

## Sprint 2 — CRUD de orçamento

### Endpoints

- `POST /api/v1/trips/:tripId/budget` — cria o orçamento da viagem.
- `GET /api/v1/trips/:tripId/budget` — consulta orçamento e resumo (gasto, saldo e percentual).
- `PUT /api/v1/budgets/:budgetId` — atualiza valor planejado e moeda.
- `DELETE /api/v1/budgets/:budgetId` — exclui somente se não houver despesas vinculadas.

### Exemplo de criação

```http
POST /api/v1/trips/20000000-0000-4000-8000-000000000001/budget
Content-Type: application/json

{
  "valorPlanejado": 5000.00,
  "moeda": "BRL"
}
```

### Preparar viagem de desenvolvimento

O schema da Sprint 1 cria a tabela `viagens`, mas não cria uma viagem automaticamente. Para testar, execute:

```sql
INSERT INTO viagens (id, titulo)
VALUES ('20000000-0000-4000-8000-000000000001', 'Viagem de demonstração')
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);
```

### Testes

```bash
npm test
```

Os testes atuais cobrem validação de payload e UUID. Os fluxos HTTP e as consultas precisam de testes de integração com um MySQL de teste configurado.

### Observações

- A API usa parâmetros SQL (`?`) para evitar SQL injection.
- O valor monetário é persistido como `DECIMAL`; o driver mantém decimais como string (`decimalNumbers: false`).
- A exclusão do orçamento é bloqueada quando há despesas.
- Autenticação/autorização e verificação de propriedade da viagem ainda não fazem parte desta sprint; não exponha esta API publicamente antes de implementá-las.
