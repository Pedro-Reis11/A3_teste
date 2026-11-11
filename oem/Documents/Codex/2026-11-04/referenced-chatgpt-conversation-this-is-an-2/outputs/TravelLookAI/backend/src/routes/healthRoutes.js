import { Router } from 'express';
import { checkDatabaseConnection } from '../config/database.js';

export const healthRoutes = Router();

healthRoutes.get('/', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'travellookai-budget-api',
    timestamp: new Date().toISOString(),
  });
});

healthRoutes.get('/db', async (_request, response) => {
  try {
    await checkDatabaseConnection();
    return response.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Falha ao verificar MySQL:', error.message);
    return response.status(503).json({ status: 'error', database: 'unavailable' });
  }
});
