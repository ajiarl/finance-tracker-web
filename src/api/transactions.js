// src/api/transactions.js
import api from './axios'

/**
 * POST /api/transactions
 * Payload: { amount, type, category_id, account_id, date, notes }
 */
export const createTransaction = (data) =>
  api.post('/transactions', data).then((r) => r.data.data)

/**
 * GET /api/transactions
 * Support query params: page, per_page, type, category_id, account_id, start_date, end_date
 */
export const getTransactions = (params = {}) =>
  api.get('/transactions', { params }).then((r) => r.data.data)

/**
 * GET /api/categories
 * Dipakai untuk dropdown kategori di FastAddModal
 */
export const getCategories = () =>
  api.get('/categories').then((r) => r.data.data)

/**
 * GET /api/accounts
 * Dipakai untuk dropdown akun di FastAddModal
 */
export const getAccounts = () =>
  api.get('/accounts').then((r) => r.data.data)

/**
 * PUT /api/transactions/:id
 */
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data).then((r) => r.data.data)

/**
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then((r) => r.data.data)
