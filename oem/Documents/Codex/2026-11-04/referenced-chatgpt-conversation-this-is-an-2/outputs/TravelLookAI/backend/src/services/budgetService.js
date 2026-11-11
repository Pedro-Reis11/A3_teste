import { randomUUID } from 'node:crypto';
import { budgetRepository } from '../repositories/budgetRepository.js';
import { HttpError } from '../utils/httpError.js';

function toMoney(value) { return Number(value).toFixed(2); }

export const budgetService = {
  async create(tripId, input) {
    if (!(await budgetRepository.findTripById(tripId))) {
      throw new HttpError(404, 'TRIP_NOT_FOUND', 'Viagem não encontrada.');
    }
    try {
      return await budgetRepository.create({ id: randomUUID(), tripId, amount: input.valorPlanejado, currency: input.moeda });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'BUDGET_ALREADY_EXISTS', 'Esta viagem já possui um orçamento.');
      throw error;
    }
  },
  async getByTrip(tripId) {
    if (!(await budgetRepository.findTripById(tripId))) throw new HttpError(404, 'TRIP_NOT_FOUND', 'Viagem não encontrada.');
    const budget = await budgetRepository.findByTripId(tripId);
    if (!budget) throw new HttpError(404, 'BUDGET_NOT_FOUND', 'Orçamento não encontrado para esta viagem.');
    const planned = Number(budget.valorPlanejado);
    const spent = Number(budget.valorGasto);
    return { ...budget, valorPlanejado: toMoney(planned), valorGasto: toMoney(spent), saldoDisponivel: toMoney(planned - spent), percentualUtilizado: Number(((spent / planned) * 100).toFixed(2)) };
  },
  async update(id, input) {
    const current = await budgetRepository.findById(id);
    if (!current) throw new HttpError(404, 'BUDGET_NOT_FOUND', 'Orçamento não encontrado.');
    return budgetRepository.update(id, input.valorPlanejado, input.moeda);
  },
  async delete(id) {
    if (!(await budgetRepository.findById(id))) throw new HttpError(404, 'BUDGET_NOT_FOUND', 'Orçamento não encontrado.');
    if (await budgetRepository.hasExpenses(id)) throw new HttpError(409, 'BUDGET_HAS_EXPENSES', 'Exclua ou transfira as despesas antes de excluir o orçamento.');
    await budgetRepository.delete(id);
  },
};
