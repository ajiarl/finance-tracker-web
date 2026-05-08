// src/router/index.jsx
// Tambahkan ProtectedRoute sebagai wrapper semua halaman dalam AppLayout.
// Route publik (login/register) tetap bebas diakses.

import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../pages/Dashboard'
import Transactions from '../pages/Transactions'
import Budgets from '../pages/Budgets'
import Accounts from '../pages/Accounts'
import Categories from '../pages/Categories'
import Settings from '../pages/Settings'
import ProtectedRoute from './ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    // Semua halaman di dalam AppLayout dibungkus ProtectedRoute
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard',     element: <Dashboard /> },
      { path: '/transactions',  element: <Transactions /> },
      { path: '/budgets',       element: <Budgets /> },
      { path: '/accounts',      element: <Accounts /> },
      { path: '/categories',    element: <Categories /> },
      { path: '/settings',      element: <Settings /> },
      {
        path: '/notifications',
        element: <div className="p-4 font-black">Notifikasi (Dalam Pengembangan)</div>,
      },
    ],
  },
])

export default router
