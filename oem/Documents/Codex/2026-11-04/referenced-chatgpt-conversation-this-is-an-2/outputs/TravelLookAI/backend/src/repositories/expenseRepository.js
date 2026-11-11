import { pool } from '../config/database.js';

const expenseSelect = `SELECT d.id, d.orcamento_id AS orcamentoId, d.categoria_id AS categoriaId,
  c.nome AS categoriaNome, d.descricao, d.valor, d.data_despesa AS dataDespesa,
  d.created_at AS createdAt, d.updated_at AS updatedAt
  FROM despesas d INNER JOIN categorias c ON c.id = d.categoria_id`;

export const expenseRepository = {
  async findBudgetById(id) {
    const [rows] = await pool.execute('SELECT id, viagem_id AS viagemId FROM orcamentos WHERE id = ?', [id]);
    return rows[0] ?? null;
  },
  async findCategoryById(id) {
    const [rows] = await pool.execute('SELECT id, nome, descricao, created_at AS createdAt FROM categorias WHERE id = ?', [id]);
    return rows[0] ?? null;
  },
  async create({ id, budgetId, categoryId, description, amount, expenseDate }) {
    await pool.execute('INSERT INTO despesas (id, orcamento_id, categoria_id, descricao, valor, data_despesa) VALUES (?, ?, ?, ?, ?, ?)',
      [id, budgetId, categoryId, description, amount.toFixed(2), expenseDate]);
    return this.findById(id);
  },
  async findById(id) {
    const [rows] = await pool.execute(`${expenseSelect} WHERE d.id = ?`, [id]);
    return rows[0] ?? null;
  },
  async listByBudget(budgetId, filters) {
    const clauses = ['d.orcamento_id = ?'];
    const values = [budgetId];
    if (filters.categoriaId) { clauses.push('d.categoria_id = ?'); values.push(filters.categoriaId); }
    if (filters.dataInicio) { clauses.push('d.data_despesa >= ?'); values.push(filters.dataInicio); }
    if (filters.dataFim) { clauses.push('d.data_despesa <= ?'); values.push(filters.dataFim); }
    const where = clauses.join(' AND ');
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM despesas d WHERE ${where}`, values);
    const [rows] = await pool.execute(`${expenseSelect} WHERE ${where} ORDER BY d.data_despesa DESC, d.created_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.limit, (filters.page - 1) * filters.limit]);
    return { rows, total: Number(countRows[0].total) };
  },
  async update(id, input) {
    const fields = [];
    const values = [];
    const mapping = { categoriaId: 'categoria_id', descricao: 'descricao', valor: 'valor', dataDespesa: 'data_despesa' };
    for (const [key, column] of Object.entries(mapping)) {
      if (input[key] !== undefined) { fields.push(`${column} = ?`); values.push(key === 'valor' ? input[key].toFixed(2) : input[key]); }
    }
    await pool.execute(`UPDATE despesas SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM despesas WHERE id = ?', [id]);
    return result.affectedRows === 1;
  },
  async listCategories() {
    const [rows] = await pool.execute('SELECT id, nome, descricao, created_at AS createdAt FROM categorias ORDER BY nome');
    return rows;
  },
  async createCategory({ id, name, description }) {
    await pool.execute('INSERT INTO categorias (id, nome, descricao) VALUES (?, ?, ?)', [id, name, description ?? null]);
    return this.findCategoryById(id);
  },
  async updateCategory(id, input) {
    const fields = [];
    const values = [];
    if (input.nome !== undefined) { fields.push('nome = ?'); values.push(input.nome); }
    if (input.descricao !== undefined) { fields.push('descricao = ?'); values.push(input.descricao); }
    await pool.execute(`UPDATE categorias SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    return this.findCategoryById(id);
  },
  async categoryHasExpenses(id) {
    const [rows] = await pool.execute('SELECT 1 FROM despesas WHERE categoria_id = ? LIMIT 1', [id]);
    return rows.length > 0;
  },
  async deleteCategory(id) {
    const [result] = await pool.execute('DELETE FROM categorias WHERE id = ?', [id]);
    return result.affectedRows === 1;
  },
};
