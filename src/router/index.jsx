import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Budgets from '../pages/Budgets';
import Settings from '../pages/Settings';

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
    element: <AppLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/transactions',
        element: <Transactions />,
      },
      {
        path: '/budgets',
        element: <Budgets />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/notifications',
        element: <div className="p-4">Notifikasi (Dalam Pengembangan)</div>,
      },
    ],
  },
]);

export default router;
