// src/pages/Dashboard.jsx
// Halaman utama aplikasi: summary cards, placeholder grafik, progress anggaran, dan FAB tambah transaksi.
// Data di-fetch via TanStack Query dari GET /api/dashboard dengan handle loading & error state.

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, AlertCircle, BarChart3 } from 'lucide-react'
import { useAuth } from '../store/authStore'
import { getDashboardSummary } from '../api/dashboard'
import FastAddModal from '../components/shared/FastAddModal'

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0)

const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// ── Sub-komponen ──────────────────────────────────────────────────────────────

// Skeleton loader — kotak abu-abu beranimasi
function Skeleton({ className = '' }) {
  return (
    <div className={`bg-gray-200 animate-pulse ${className}`} />
  )
}

// Summary card utama (Saldo)
function BalanceCard({ balance, isLoading }) {
  return (
    <div className="bg-[#FAFF00] border-4 border-black shadow-[6px_6px_0px_0px_#000] p-4 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase tracking-widest text-black/60">
          Total Saldo
        </span>
        <div className="bg-black p-1.5">
          <Wallet size={16} className="text-[#FAFF00]" />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-9 w-48 mt-1" />
      ) : (
        <p className="text-3xl font-black text-black tracking-tight">
          {formatIDR(balance)}
        </p>
      )}
      <p className="text-xs font-bold text-black/50 mt-1 uppercase">
        {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}

// Card pemasukan / pengeluaran
function FlowCard({ label, amount, type, isLoading }) {
  const isIncome = type === 'income'
  return (
    <div
      className={[
        'border-4 border-black shadow-[4px_4px_0px_0px_#000] p-3 text-left',
        isIncome ? 'bg-white' : 'bg-white',
      ].join(' ')}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div
          className={[
            'p-1 border-2 border-black',
            isIncome ? 'bg-green-400' : 'bg-red-400',
          ].join(' ')}
        >
          {isIncome
            ? <TrendingUp size={13} className="text-black" strokeWidth={2.5} />
            : <TrendingDown size={13} className="text-black" strokeWidth={2.5} />
          }
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {label}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-28" />
      ) : (
        <p
          className={[
            'text-lg font-black tracking-tight',
            isIncome ? 'text-green-700' : 'text-red-600',
          ].join(' ')}
        >
          {isIncome ? '+' : '-'}{formatIDR(amount)}
        </p>
      )}
    </div>
  )
}

// Progress bar anggaran — blocky, gaya retro
function BudgetProgressItem({ budget }) {
  const pct = Math.min(budget.percentage_used ?? 0, 100)
  const isWarning = pct >= 75 && pct < 100
  const isDanger  = pct >= 100

  const barColor = isDanger
    ? 'bg-red-500'
    : isWarning
    ? 'bg-[#FAFF00]'
    : 'bg-green-400'

  return (
    <div className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_0px_#000] text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black text-black truncate max-w-[55%]">
          {budget.name}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={[
              'text-xs font-black px-1.5 py-0.5 border-2 border-black',
              isDanger
                ? 'bg-red-500 text-white'
                : isWarning
                ? 'bg-[#FAFF00] text-black'
                : 'bg-white text-black',
            ].join(' ')}
          >
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      {/* Track bergaris keras (bukan rounded) */}
      <div className="w-full h-4 bg-gray-100 border-2 border-black overflow-hidden">
        <div
          className={`h-full ${barColor} border-r-2 border-black transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-bold text-gray-500">
          {formatIDR(budget.spent)}
        </span>
        <span className="text-[10px] font-bold text-gray-400">
          / {formatIDR(budget.amount)}
        </span>
      </div>
    </div>
  )
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const firstName = user?.name?.split(' ')[0] ?? 'Kamu'
  const month = currentMonth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => getDashboardSummary(month),
    staleTime: 1000 * 60 * 2, // 2 menit
  })

  // ── Error State ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 gap-4">
        <div className="bg-red-50 border-4 border-red-500 shadow-[4px_4px_0px_0px_rgb(239,68,68)] p-5 w-full max-w-sm text-center">
          <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
          <p className="font-black text-red-600 uppercase text-sm">Gagal memuat data</p>
          <p className="text-xs text-red-400 mt-1">Periksa koneksi dan coba lagi.</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-black text-white font-black text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#555] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_0px_#555] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-100"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-4 pb-6 space-y-5 relative">

      {/* Greeting */}
      <div className="text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Selamat datang,
        </p>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-tight">
          {firstName}
        </h1>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <section>
        <BalanceCard balance={data?.total_balance} isLoading={isLoading} />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <FlowCard
            label="Pemasukan"
            amount={data?.income_this_month}
            type="income"
            isLoading={isLoading}
          />
          <FlowCard
            label="Pengeluaran"
            amount={data?.expense_this_month}
            type="expense"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* ── Placeholder Grafik ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-black">
            Tren Pengeluaran
          </h2>
          <div className="flex-1 h-0.5 bg-black" />
        </div>
        <div className="border-4 border-black shadow-[4px_4px_0px_0px_#000] bg-white p-4 h-44 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 border-4 border-black bg-gray-100 flex items-center justify-center">
            <BarChart3 size={24} className="text-black" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Grafik segera hadir
          </p>
          {/* Chart.js akan dirender di sini */}
        </div>
      </section>

      {/* ── Progress Anggaran ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 w-full">
            <h2 className="text-xs font-black uppercase tracking-widest text-black">
              Anggaran Bulan Ini
            </h2>
            <div className="flex-1 h-0.5 bg-black" />
          </div>
          <button
            onClick={() => navigate('/budgets')}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 underline decoration-2 ml-2 whitespace-nowrap"
          >
            Lihat Semua
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 border-2 border-gray-300" />
            ))}
          </div>
        ) : data?.budgets?.length > 0 ? (
          <div className="space-y-3">
            {data.budgets.slice(0, 4).map((b) => (
              <BudgetProgressItem key={b.id} budget={b} />
            ))}
          </div>
        ) : (
          <div className="border-4 border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm font-black uppercase text-gray-400">
              Belum ada anggaran
            </p>
            <button
              onClick={() => navigate('/budgets')}
              className="mt-2 text-xs font-black underline decoration-2 text-black"
            >
              + Buat Anggaran
            </button>
          </div>
        )}
      </section>

      {/* FAB - Floating Add Button */}
      <FAB onClick={() => setIsModalOpen(true)} />

      {/* Fast Add Transaction Modal */}
      <FastAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  )
}

// ── FAB (Fast Add Transaction) ─────────────────────────────────────────────
export function FAB({ onClick }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={onClick}
      aria-label="Tambah transaksi"
      className={[
        'fixed bottom-20 right-4 z-50',
        'w-14 h-14 bg-black text-white',
        'border-4 border-black shadow-[5px_5px_0px_0px_#555]',
        'flex items-center justify-center',
        'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#555]',
        'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        'transition-all duration-100',
      ].join(' ')}
    >
      <Plus size={28} strokeWidth={3} />
    </button>
  )
}
