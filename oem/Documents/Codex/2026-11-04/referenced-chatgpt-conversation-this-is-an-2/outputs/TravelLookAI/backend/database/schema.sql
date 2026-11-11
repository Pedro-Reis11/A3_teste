-- TravelLookAI - Sprints 1 a 5
-- MySQL 8.0.16+ (CHECK constraints efetivamente aplicadas a partir dessa versão).
-- Este script cria uma tabela mínima de viagens para permitir executar a Sprint 1
-- isoladamente. Se o projeto já possuir `viagens`, adapte/remova esse bloco e
-- garanta que `viagens.id` tenha exatamente o mesmo tipo de `orcamentos.viagem_id`.

CREATE DATABASE IF NOT EXISTS travellookai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE travellookai;

CREATE TABLE IF NOT EXISTS viagens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orcamentos (
  id CHAR(36) NOT NULL PRIMARY KEY,
  viagem_id CHAR(36) NOT NULL,
  valor_planejado DECIMAL(12, 2) NOT NULL,
  moeda CHAR(3) NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_orcamentos_viagem UNIQUE (viagem_id),
  CONSTRAINT fk_orcamentos_viagem
    FOREIGN KEY (viagem_id) REFERENCES viagens(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_orcamentos_valor CHECK (valor_planejado > 0),
  CONSTRAINT chk_orcamentos_moeda CHECK (moeda REGEXP '^[A-Z]{3}$')
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id CHAR(36) NOT NULL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_categorias_nome UNIQUE (nome)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS despesas (
  id CHAR(36) NOT NULL PRIMARY KEY,
  orcamento_id CHAR(36) NOT NULL,
  categoria_id CHAR(36) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_despesa DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_despesas_orcamento
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_despesas_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_despesas_valor CHECK (valor > 0),
  INDEX idx_despesas_orcamento_data (orcamento_id, data_despesa),
  INDEX idx_despesas_orcamento_categoria (orcamento_id, categoria_id),
  INDEX idx_despesas_categoria (categoria_id)
) ENGINE=InnoDB;

-- IDs fixos tornam o seed repetível sem duplicar categorias a cada execução.
INSERT INTO categorias (id, nome, descricao) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Alimentação', 'Restaurantes e refeições'),
  ('10000000-0000-4000-8000-000000000002', 'Hospedagem', 'Hotéis e acomodações'),
  ('10000000-0000-4000-8000-000000000003', 'Transporte', 'Passagens e deslocamentos'),
  ('10000000-0000-4000-8000-000000000004', 'Passeios', 'Ingressos e atrações'),
  ('10000000-0000-4000-8000-000000000005', 'Compras', 'Compras pessoais e souvenirs'),
  ('10000000-0000-4000-8000-000000000006', 'Outros', 'Despesas diversas')
ON DUPLICATE KEY UPDATE
  descricao = VALUES(descricao);

-- Dados mínimos opcionais para validar a relação e testar consultas na Sprint 1.
-- Remova os comentários para inserir uma viagem de desenvolvimento.
-- INSERT INTO viagens (id, titulo)
-- VALUES ('20000000-0000-4000-8000-000000000001', 'Viagem de demonstração')
-- ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);
