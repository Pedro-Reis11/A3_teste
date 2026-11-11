import { pool } from '../config/database.js';

export const dashboardRepository = {
  async findTripById(id) {
    const [rows] = await pool.execute('SELECT id FROM viagens WHERE id = ?', [id]);
    return rows[0] ?? null;
  },
  async getSummary(tripId) {
    const [rows] = await pool.execute(`SELECT o.id AS orcamentoId, o.valor_planejado AS valorPlanejado, o.moeda,
      COALESCE(SUM(d.valor), 0) AS valorGasto, COUNT(d.id) AS quantidadeDespesas
      FROM orcamentos o LEFT JOIN despesas d ON d.orcamento_id = o.id
      WHERE o.viagem_id = ? GROUP BY o.id`, [tripId]);
    return rows[0] ?? null;
  },
  async getCategories(budgetId) {
    const [rows] = await pool.execute(`SELECT c.id AS categoriaId, c.nome AS categoriaNome,
      COALESCE(SUM(d.valor), 0) AS valorGasto, COUNT(d.id) AS quantidadeDespesas
      FROM categorias c LEFT JOIN despesas d ON d.categoria_id = c.id AND d.orcamento_id = ?
      GROUP BY c.id ORDER BY valorGasto DESC, c.nome`, [budgetId]);
    return rows;
  },
};
