// src/api/transactions.js
import api from './axios'

/**
 * POST /api/transactions
 * Payload: { amount, type, category_id, account_id, date, notes }
 */
export const createTransaction = (data) =>
  api.post('/transactions', data)

/**
 * GET /api/transactions
 * Support query params: page, per_page, type, category_id, account_id, start_date, end_date
 */
export const getTransactions = (params = {}) =>
  api.get('/transactions', { params })

/**
 * GET /api/categories
 * Dipakai untuk dropdown kategori di FastAddModal
 */
export const getCategories = () =>
  api.get('/categories')

/**
 * GET /api/accounts
 * Dipakai untuk dropdown akun di FastAddModal
 */
export const getAccounts = () =>
  api.get('/accounts')
