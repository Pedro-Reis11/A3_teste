import test from 'node:test';
import assert from 'node:assert/strict';
import { createBudgetSchema, tripIdParamsSchema } from '../src/validators/budgetValidator.js';

test('aceita orçamento positivo e normaliza moeda', () => {
  const result = createBudgetSchema.parse({ valorPlanejado: '1500.50', moeda: 'brl' });
  assert.equal(result.valorPlanejado, 1500.5);
  assert.equal(result.moeda, 'BRL');
});

test('rejeita orçamento zero', () => {
  assert.equal(createBudgetSchema.safeParse({ valorPlanejado: 0 }).success, false);
});

test('rejeita UUID inválido na rota', () => {
  assert.equal(tripIdParamsSchema.safeParse({ tripId: '123' }).success, false);
});
