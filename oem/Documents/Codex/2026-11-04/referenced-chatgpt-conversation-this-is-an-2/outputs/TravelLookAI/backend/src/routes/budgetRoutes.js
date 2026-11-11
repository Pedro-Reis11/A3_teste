import { Router } from 'express';
import { budgetController } from '../controllers/budgetController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const budgetRoutes = Router();
budgetRoutes.post('/trips/:tripId/budget', asyncHandler(budgetController.create));
budgetRoutes.get('/trips/:tripId/budget', asyncHandler(budgetController.getByTrip));
budgetRoutes.put('/budgets/:budgetId', asyncHandler(budgetController.update));
budgetRoutes.delete('/budgets/:budgetId', asyncHandler(budgetController.delete));
