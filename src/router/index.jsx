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
import Notifications from '../pages/Notifications'
import Settings from '../pages/Settings'
import ImportFlow from '../pages/ImportFlow'
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
      { path: '/notifications', element: <Notifications /> },
      { path: '/settings',      element: <Settings /> },
      { path: '/import',        element: <ImportFlow /> },
    ],
  },
])

export default router
