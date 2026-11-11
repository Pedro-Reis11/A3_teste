import { Router } from 'express';
import { expenseController } from '../controllers/expenseController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const expenseRoutes = Router();
expenseRoutes.get('/categories', asyncHandler(expenseController.listCategories));
expenseRoutes.post('/categories', asyncHandler(expenseController.createCategory));
expenseRoutes.put('/categories/:categoryId', asyncHandler(expenseController.updateCategory));
expenseRoutes.delete('/categories/:categoryId', asyncHandler(expenseController.deleteCategory));
expenseRoutes.post('/budgets/:budgetId/expenses', asyncHandler(expenseController.create));
expenseRoutes.get('/budgets/:budgetId/expenses', asyncHandler(expenseController.list));
expenseRoutes.get('/expenses/:expenseId', asyncHandler(expenseController.get));
expenseRoutes.put('/expenses/:expenseId', asyncHandler(expenseController.update));
expenseRoutes.delete('/expenses/:expenseId', asyncHandler(expenseController.delete));
