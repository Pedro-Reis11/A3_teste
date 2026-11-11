import { ZodError } from 'zod';

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: error.issues.map(({ path, message }) => ({ field: path.join('.'), message })) } });
  }
  if (error.status && error.code) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(404).json({ error: { code: 'RELATED_RECORD_NOT_FOUND', message: 'Registro relacionado não encontrado.' } });
  }
  console.error(error);
  return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Ocorreu um erro interno.' } });
}
