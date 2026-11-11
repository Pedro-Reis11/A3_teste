import { z } from 'zod';

const uuid = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a data no formato AAAA-MM-DD.');

export const budgetIdParamsSchema = z.object({ budgetId: uuid });
export const expenseIdParamsSchema = z.object({ expenseId: uuid });
export const categoryIdParamsSchema = z.object({ categoryId: uuid });
export const tripIdParamsSchema = z.object({ tripId: uuid });

const expenseFields = {
  categoriaId: uuid,
  descricao: z.string().trim().min(1).max(255),
  valor: z.coerce.number().finite().positive().max(9999999999.99),
  dataDespesa: date,
};

export const createExpenseSchema = z.object(expenseFields).strict();
export const updateExpenseSchema = z.object(expenseFields).partial().strict().refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo para atualização.');
export const expenseQuerySchema = z.object({
  categoriaId: uuid.optional(),
  dataInicio: date.optional(),
  dataFim: date.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
}).strict().refine((value) => !value.dataInicio || !value.dataFim || value.dataInicio <= value.dataFim, {
  message: 'dataInicio deve ser anterior ou igual a dataFim.', path: ['dataFim'],
});

export const createCategorySchema = z.object({
  nome: z.string().trim().min(1).max(50),
  descricao: z.string().trim().max(255).optional(),
}).strict();
export const updateCategorySchema = createCategorySchema.partial().refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo para atualização.');
