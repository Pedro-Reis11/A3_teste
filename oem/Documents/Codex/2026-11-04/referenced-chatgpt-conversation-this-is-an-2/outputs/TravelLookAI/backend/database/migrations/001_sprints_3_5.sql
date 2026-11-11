-- Execute apenas em bancos criados com uma versão anterior do schema.
USE travellookai;

CREATE INDEX idx_despesas_orcamento_categoria
  ON despesas (orcamento_id, categoria_id);
