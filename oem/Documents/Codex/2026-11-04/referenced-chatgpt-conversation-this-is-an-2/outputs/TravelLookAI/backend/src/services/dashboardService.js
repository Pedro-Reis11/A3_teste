import { dashboardRepository } from '../repositories/dashboardRepository.js';
import { HttpError } from '../utils/httpError.js';

const money = (value) => Number(value).toFixed(2);

export const dashboardService = {
  async getByTrip(tripId) {
    if (!(await dashboardRepository.findTripById(tripId))) throw new HttpError(404, 'TRIP_NOT_FOUND', 'Viagem não encontrada.');
    const summary = await dashboardRepository.getSummary(tripId);
    if (!summary) throw new HttpError(404, 'BUDGET_NOT_FOUND', 'Orçamento não encontrado para esta viagem.');
    const planned = Number(summary.valorPlanejado);
    const spent = Number(summary.valorGasto);
    const categories = await dashboardRepository.getCategories(summary.orcamentoId);
    return {
      orcamentoId: summary.orcamentoId, moeda: summary.moeda, valorPlanejado: money(planned), valorGasto: money(spent), saldoDisponivel: money(planned - spent), percentualUtilizado: Number(((spent / planned) * 100).toFixed(2)), quantidadeDespesas: Number(summary.quantidadeDespesas),
      categorias: categories.map((category) => ({ ...category, valorGasto: money(category.valorGasto), quantidadeDespesas: Number(category.quantidadeDespesas), percentualDoGasto: spent === 0 ? 0 : Number(((Number(category.valorGasto) / spent) * 100).toFixed(2)) })),
    };
  },
};
