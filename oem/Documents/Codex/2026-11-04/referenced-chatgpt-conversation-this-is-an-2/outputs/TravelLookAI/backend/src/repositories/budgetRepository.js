import { pool } from '../config/database.js';

export const budgetRepository = {
  async findTripById(tripId) {
    const [rows] = await pool.execute('SELECT id FROM viagens WHERE id = ?', [tripId]);
    return rows[0] ?? null;
  },
  async create({ id, tripId, amount, currency }) {
    await pool.execute(
      'INSERT INTO orcamentos (id, viagem_id, valor_planejado, moeda) VALUES (?, ?, ?, ?)',
      [id, tripId, amount.toFixed(2), currency],
    );
    return this.findById(id);
  },
  async findByTripId(tripId) {
    const [rows] = await pool.execute(
      `SELECT o.id, o.viagem_id AS viagemId, o.valor_planejado AS valorPlanejado, o.moeda,
              o.created_at AS createdAt, o.updated_at AS updatedAt,
              COALESCE(SUM(d.valor), 0) AS valorGasto
       FROM orcamentos o LEFT JOIN despesas d ON d.orcamento_id = o.id
       WHERE o.viagem_id = ? GROUP BY o.id`, [tripId]);
    return rows[0] ?? null;
  },
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, viagem_id AS viagemId, valor_planejado AS valorPlanejado, moeda,
              created_at AS createdAt, updated_at AS updatedAt
       FROM orcamentos WHERE id = ?`, [id]);
    return rows[0] ?? null;
  },
  async update(id, amount, currency) {
    await pool.execute('UPDATE orcamentos SET valor_planejado = ?, moeda = ? WHERE id = ?',
      [amount.toFixed(2), currency, id]);
    return this.findById(id);
  },
  async hasExpenses(id) {
    const [rows] = await pool.execute('SELECT 1 FROM despesas WHERE orcamento_id = ? LIMIT 1', [id]);
    return rows.length > 0;
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM orcamentos WHERE id = ?', [id]);
    return result.affectedRows === 1;
  },
};
