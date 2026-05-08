// src/router/ProtectedRoute.jsx
// Guard yang mengecek token di authStore sebelum merender halaman protected.
// Jika belum login, redirect ke /login dan simpan intended path agar bisa kembali setelah login.

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Simpan halaman yang ingin dituju sebelum redirect login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
