import { z } from 'zod';

const uuid = z.string().uuid();
export const tripIdParamsSchema = z.object({ tripId: uuid });
export const budgetIdParamsSchema = z.object({ budgetId: uuid });
export const createBudgetSchema = z.object({
  valorPlanejado: z.coerce.number().finite().positive().max(9999999999.99),
  moeda: z.string().trim().length(3).regex(/^[A-Za-z]{3}$/).transform((v) => v.toUpperCase()).default('BRL'),
}).strict();
export const updateBudgetSchema = createBudgetSchema;
