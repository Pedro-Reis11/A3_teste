import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { budgetRoutes } from './routes/budgetRoutes.js';
import { expenseRoutes } from './routes/expenseRoutes.js';
import { dashboardRoutes } from './routes/dashboardRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_request, response) => {
  response.status(200).json({
    name: 'TravelLookAI Budget API',
    version: '1.2.0',
    docs: 'Consulte o README.md para instruções e endpoints disponíveis.',
  });
});

app.use('/health', healthRoutes);
app.use('/api/v1', budgetRoutes);
app.use('/api/v1', expenseRoutes);
app.use('/api/v1', dashboardRoutes);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Endpoint não encontrado.',
    },
  });
});

app.use(errorHandler);
