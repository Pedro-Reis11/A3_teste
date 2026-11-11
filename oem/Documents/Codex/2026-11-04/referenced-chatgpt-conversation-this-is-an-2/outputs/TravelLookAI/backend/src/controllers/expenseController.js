import { expenseService } from '../services/expenseService.js';
import { budgetIdParamsSchema, categoryIdParamsSchema, createCategorySchema, createExpenseSchema, expenseIdParamsSchema, expenseQuerySchema, updateCategorySchema, updateExpenseSchema } from '../validators/expenseValidator.js';

export const expenseController = {
  async create(req, res) { const { budgetId } = budgetIdParamsSchema.parse(req.params); res.status(201).json({ data: await expenseService.create(budgetId, createExpenseSchema.parse(req.body)) }); },
  async list(req, res) { const { budgetId } = budgetIdParamsSchema.parse(req.params); res.json(await expenseService.list(budgetId, expenseQuerySchema.parse(req.query))); },
  async get(req, res) { const { expenseId } = expenseIdParamsSchema.parse(req.params); res.json({ data: await expenseService.get(expenseId) }); },
  async update(req, res) { const { expenseId } = expenseIdParamsSchema.parse(req.params); res.json({ data: await expenseService.update(expenseId, updateExpenseSchema.parse(req.body)) }); },
  async delete(req, res) { const { expenseId } = expenseIdParamsSchema.parse(req.params); await expenseService.delete(expenseId); res.status(204).send(); },
  async listCategories(_req, res) { res.json({ data: await expenseService.listCategories() }); },
  async createCategory(req, res) { res.status(201).json({ data: await expenseService.createCategory(createCategorySchema.parse(req.body)) }); },
  async updateCategory(req, res) { const { categoryId } = categoryIdParamsSchema.parse(req.params); res.json({ data: await expenseService.updateCategory(categoryId, updateCategorySchema.parse(req.body)) }); },
  async deleteCategory(req, res) { const { categoryId } = categoryIdParamsSchema.parse(req.params); await expenseService.deleteCategory(categoryId); res.status(204).send(); },
};
