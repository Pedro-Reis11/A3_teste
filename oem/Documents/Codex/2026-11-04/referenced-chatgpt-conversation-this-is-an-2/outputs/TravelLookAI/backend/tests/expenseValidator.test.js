import test from 'node:test';
import assert from 'node:assert/strict';
import { createExpenseSchema, expenseQuerySchema, updateExpenseSchema } from '../src/validators/expenseValidator.js';

const categoryId = '10000000-0000-4000-8000-000000000001';

test('aceita e converte uma despesa válida', () => {
  const result = createExpenseSchema.parse({ categoriaId: categoryId, descricao: 'Almoço', valor: '42.90', dataDespesa: '2026-11-04' });
  assert.equal(result.valor, 42.9);
  assert.equal(result.descricao, 'Almoço');
});

test('rejeita valor inválido e data fora do formato ISO', () => {
  assert.equal(createExpenseSchema.safeParse({ categoriaId: categoryId, descricao: 'X', valor: 0, dataDespesa: '04/11/2026' }).success, false);
});

test('valida intervalo e paginação dos filtros', () => {
  assert.equal(expenseQuerySchema.safeParse({ dataInicio: '2026-11-10', dataFim: '2026-11-01' }).success, false);
  const result = expenseQuerySchema.parse({ page: '2', limit: '10' });
  assert.deepEqual(result, { page: 2, limit: 10 });
});

test('exige ao menos um campo ao atualizar despesa', () => {
  assert.equal(updateExpenseSchema.safeParse({}).success, false);
});
