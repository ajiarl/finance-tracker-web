// src/components/layout/BottomNav.jsx
// Bottom navigation bar mobile-first dengan gaya Neobrutalism: border atas tebal dan active state
// berupa kotak warna solid bergaya "ditekan" menggunakan hard shadow kecil.

import { NavLink } from 'react-router-dom'
import { Home, ArrowLeftRight, Target, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard',    label: 'Beranda',    Icon: Home           },
  { to: '/transactions', label: 'Transaksi',  Icon: ArrowLeftRight },
  { to: '/budgets',      label: 'Anggaran',   Icon: Target         },
  { to: '/settings',     label: 'Pengaturan', Icon: Settings       },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-black">
      <ul className="flex items-stretch h-16">
        {navItems.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-0.5 h-full w-full',
                  'text-xs font-bold uppercase tracking-wide transition-colors',
                  isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'flex items-center justify-center w-9 h-9',
                      'transition-all duration-100',
                      isActive
                        ? 'bg-[#FAFF00] border-2 border-black shadow-[2px_2px_0px_0px_#000] translate-x-px translate-y-px'
                        : '',
                    ].join(' ')}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className={isActive ? 'text-black' : 'text-gray-400'}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
