// src/components/layout/AppLayout.jsx
// Wrapper utama semua halaman dalam: Topbar retro di atas, Outlet di tengah, BottomNav fixed di bawah.
// pb-24 pada area konten memastikan tidak ada elemen yang tertutup BottomNav saat di-scroll.

import { Outlet, Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import BottomNav from './BottomNav'
import { useNotifications } from '../../hooks/useNotifications.jsx'
import NotificationBadge from '../notifications/NotificationBadge'
import { Toaster } from 'react-hot-toast'

export default function AppLayout() {
  const { unreadCount } = useNotifications()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Toaster position="top-right" reverseOrder={false} />

      {/* ── Topbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-black">
        <div className="flex items-center justify-between px-4 h-14">

          {/* Brand */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 no-underline"
          >
            <span className="font-black text-base uppercase tracking-tight text-black">
              Finance Tracker
            </span>
          </Link>

          {/* Notifikasi */}
          <Link
            to="/notifications"
            aria-label="Notifikasi"
            className="relative flex items-center justify-center w-9 h-9 border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
          >
            <Bell size={18} strokeWidth={2.5} className="text-black" />
            <NotificationBadge count={unreadCount} />
          </Link>

        </div>
      </header>

      {/* ── Konten Utama ─────────────────────────────────────────── */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* ── Bottom Navigation ─────────────────────────────────────── */}
      <BottomNav />

    </div>
  )
}
