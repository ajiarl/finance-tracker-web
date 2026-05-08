// src/api/auth.js
// Fungsi-fungsi API untuk autentikasi: login, register, logout, dan ambil user aktif.
// Semua request sudah otomatis menyertakan Bearer token via interceptor di axios.js.

import api from './axios'

export const login = (data) =>
  api.post('/login', data)

export const register = (data) =>
  api.post('/register', data)

export const logout = () =>
  api.post('/logout')

export const getUser = () =>
  api.get('/user')
