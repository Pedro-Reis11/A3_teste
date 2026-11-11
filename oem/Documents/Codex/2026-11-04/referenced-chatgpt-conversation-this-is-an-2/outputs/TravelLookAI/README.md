# TravelLookAI — Sprints 3, 4 e 5

Projeto integrado para acompanhamento financeiro de viagens: API em Node.js/Express/MySQL e aplicativo React Native com Expo.

## Estrutura

```text
backend/  API REST, schema MySQL, testes de validação
mobile/   Aplicativo React Native (Expo)
```

## Requisitos

- Node.js 20+
- MySQL 8.0.16+
- npm
- Expo Go para testar em dispositivo físico, opcionalmente Android Studio ou Xcode

## Configuração rápida

1. Importe `backend/database/schema.sql` no MySQL. Para uma instalação Sprint 2 existente, aplique `backend/database/migrations/001_sprints_3_5.sql` uma única vez.
2. Copie `backend/.env.example` para `backend/.env` e configure a conexão MySQL.
3. Crie uma viagem de desenvolvimento:

```sql
USE travellookai;
INSERT INTO viagens (id, titulo)
VALUES ('20000000-0000-4000-8000-000000000001', 'Viagem de demonstração')
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);
```

4. Inicie o backend:

```bash
cd backend
npm install
npm run db:check
npm test
npm run dev
```

5. Em outro terminal, configure e inicie o aplicativo:

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

No Android Emulator, use `http://10.0.2.2:3000/api/v1`; no simulador iOS, `http://localhost:3000/api/v1`; em celular físico, substitua pelo IP local da máquina que executa a API. O identificador da viagem fica em `EXPO_PUBLIC_TRIP_ID`.

## API

Todas as respostas de sucesso usam `{ "data": ... }`, exceto a listagem de despesas, que contém `data` e `pagination`.

| Método | Endpoint | Função |
| --- | --- | --- |
| POST | `/api/v1/trips/:tripId/budget` | Cria orçamento |
| GET | `/api/v1/trips/:tripId/budget` | Consulta orçamento e saldo |
| PUT/DELETE | `/api/v1/budgets/:budgetId` | Altera/exclui orçamento |
| GET/POST | `/api/v1/categories` | Lista/cria categorias |
| PUT/DELETE | `/api/v1/categories/:categoryId` | Altera/exclui categoria sem despesas |
| GET/POST | `/api/v1/budgets/:budgetId/expenses` | Lista filtrada/cria despesa |
| GET/PUT/DELETE | `/api/v1/expenses/:expenseId` | Consulta/altera/exclui despesa |
| GET | `/api/v1/trips/:tripId/dashboard` | Métricas e resumo por categoria |

### Filtros de despesas

`GET /api/v1/budgets/:budgetId/expenses?categoriaId=<uuid>&dataInicio=2026-11-01&dataFim=2026-11-30&page=1&limit=20`

`dataInicio` e `dataFim` usam `AAAA-MM-DD`; `limit` aceita até 100. Campos financeiros aceitam número e são serializados com duas casas decimais.

### Exemplo de despesa

```json
{
  "categoriaId": "10000000-0000-4000-8000-000000000001",
  "descricao": "Almoço no centro",
  "valor": 42.90,
  "dataDespesa": "2026-11-04"
}
```

## Cobertura e limites

Os testes automatizados cobrem validação e normalização de payloads. Os endpoints com MySQL requerem uma instância MySQL configurada e não são executados sem ela. Autenticação, autorização e separação de usuários não fazem parte desta entrega; não exponha a API à internet pública sem essas proteções. Para desenvolvimento móvel, `CORS_ORIGIN=*` é prático, mas deve ser substituído pelas origens aprovadas em produção.
