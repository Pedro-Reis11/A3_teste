import { budgetService } from '../services/budgetService.js';
import { createBudgetSchema, tripIdParamsSchema, budgetIdParamsSchema, updateBudgetSchema } from '../validators/budgetValidator.js';

export const budgetController = {
  async create(req, res) {
    const { tripId } = tripIdParamsSchema.parse(req.params);
    const body = createBudgetSchema.parse(req.body);
    const budget = await budgetService.create(tripId, body);
    res.status(201).json({ data: budget });
  },
  async getByTrip(req, res) {
    const { tripId } = tripIdParamsSchema.parse(req.params);
    res.json({ data: await budgetService.getByTrip(tripId) });
  },
  async update(req, res) {
    const { budgetId } = budgetIdParamsSchema.parse(req.params);
    const body = updateBudgetSchema.parse(req.body);
    res.json({ data: await budgetService.update(budgetId, body) });
  },
  async delete(req, res) {
    const { budgetId } = budgetIdParamsSchema.parse(req.params);
    await budgetService.delete(budgetId);
    res.status(204).send();
  },
};
