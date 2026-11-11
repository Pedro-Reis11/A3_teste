import { dashboardService } from '../services/dashboardService.js';
import { tripIdParamsSchema } from '../validators/expenseValidator.js';

export const dashboardController = {
  async getByTrip(req, res) { const { tripId } = tripIdParamsSchema.parse(req.params); res.json({ data: await dashboardService.getByTrip(tripId) }); },
};
