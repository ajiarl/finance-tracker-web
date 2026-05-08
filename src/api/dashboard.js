// src/api/dashboard.js
// Fungsi fetcher untuk dua endpoint dashboard: summary (kartu ringkasan) dan charts (data grafik).
// Kedua fungsi ini akan dipanggil via useQuery di Dashboard.jsx.

import api from './axios'

export const getDashboardSummary = (month) =>
  api.get('/dashboard', { params: month ? { month } : {} }).then((r) => r.data.data)

export const getDashboardCharts = (month) =>
  api.get('/dashboard/charts', { params: month ? { month } : {} }).then((r) => r.data.data)
