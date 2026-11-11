import { randomUUID } from 'node:crypto';
import { expenseRepository } from '../repositories/expenseRepository.js';
import { HttpError } from '../utils/httpError.js';

function money(value) { return Number(value).toFixed(2); }
function formatExpense(expense) { return { ...expense, valor: money(expense.valor) }; }

export const expenseService = {
  async create(budgetId, input) {
    if (!(await expenseRepository.findBudgetById(budgetId))) throw new HttpError(404, 'BUDGET_NOT_FOUND', 'Orçamento não encontrado.');
    if (!(await expenseRepository.findCategoryById(input.categoriaId))) throw new HttpError(404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
    return formatExpense(await expenseRepository.create({ id: randomUUID(), budgetId, categoryId: input.categoriaId, description: input.descricao, amount: input.valor, expenseDate: input.dataDespesa }));
  },
  async list(budgetId, filters) {
    if (!(await expenseRepository.findBudgetById(budgetId))) throw new HttpError(404, 'BUDGET_NOT_FOUND', 'Orçamento não encontrado.');
    const result = await expenseRepository.listByBudget(budgetId, filters);
    return { data: result.rows.map(formatExpense), pagination: { page: filters.page, limit: filters.limit, total: result.total, totalPages: Math.ceil(result.total / filters.limit) } };
  },
  async get(id) {
    const expense = await expenseRepository.findById(id);
    if (!expense) throw new HttpError(404, 'EXPENSE_NOT_FOUND', 'Despesa não encontrada.');
    return formatExpense(expense);
  },
  async update(id, input) {
    await this.get(id);
    if (input.categoriaId && !(await expenseRepository.findCategoryById(input.categoriaId))) throw new HttpError(404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
    return formatExpense(await expenseRepository.update(id, input));
  },
  async delete(id) {
    await this.get(id);
    await expenseRepository.delete(id);
  },
  async listCategories() { return expenseRepository.listCategories(); },
  async createCategory(input) {
    try { return await expenseRepository.createCategory({ id: randomUUID(), name: input.nome, description: input.descricao }); }
    catch (error) { if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'CATEGORY_ALREADY_EXISTS', 'Já existe uma categoria com este nome.'); throw error; }
  },
  async updateCategory(id, input) {
    if (!(await expenseRepository.findCategoryById(id))) throw new HttpError(404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
    try { return await expenseRepository.updateCategory(id, input); }
    catch (error) { if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'CATEGORY_ALREADY_EXISTS', 'Já existe uma categoria com este nome.'); throw error; }
  },
  async deleteCategory(id) {
    if (!(await expenseRepository.findCategoryById(id))) throw new HttpError(404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
    if (await expenseRepository.categoryHasExpenses(id)) throw new HttpError(409, 'CATEGORY_HAS_EXPENSES', 'Não é possível excluir uma categoria com despesas vinculadas.');
    await expenseRepository.deleteCategory(id);
  },
};
