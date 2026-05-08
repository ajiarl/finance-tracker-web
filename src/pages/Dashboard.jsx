// src/pages/Dashboard.jsx
// Halaman utama aplikasi: saldo, ringkasan kartu, grafik tren, breakdown kategori, dan progress anggaran.
// Terintegrasi dengan backend via TanStack Query untuk data riil.

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react'
import { useAuth } from '../store/authStore'
import { getDashboardSummary, getDashboardCharts } from '../api/dashboard'
import toast from 'react-hot-toast'

import FastAddModal from '../components/shared/FastAddModal'
import TrendChart from '../components/shared/TrendChart'
import CategoryPieChart from '../components/shared/CategoryPieChart'
import BudgetProgress from '../components/shared/BudgetProgress'

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

// Skeleton loader
function Skeleton({ className = '' }) {
  return (
    <div className={`bg-gray-200 animate-pulse ${className}`} />
  )
}

// Ringkasan kartu (Pemasukan/Pengeluaran)
function SummaryCard({ label, value, icon: Icon, bg, isLoading }) {
  return (
    <div className={`flex flex-col gap-1 p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] ${bg} text-left rounded-none`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
          {label}
        </span>
        <Icon size={16} strokeWidth={3} className="text-black/40" />
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-24 mt-1 rounded-none" />
      ) : (
        <span className="text-base font-black leading-tight text-black">
          {formatIDR(value)}
        </span>
      )}
    </div>
  )
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Tambah baru"
      className="fixed bottom-24 right-6 z-[100] flex items-center justify-center w-12 h-12 bg-[#FAFF00] border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
    >
      <Plus size={20} strokeWidth={3} className="text-black" />
    </button>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const month = currentMonth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'summary', month],
    queryFn: () => getDashboardSummary(month),
    staleTime: 1000 * 60 * 2,
  })

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['dashboard', 'charts', month],
    queryFn: () => getDashboardCharts(month),
    staleTime: 1000 * 60 * 5,
  })

  // ── Data Mappers ───────────────────────────────────────────────────────────
  
  // Trend Chart: Tampilkan 7 hari terakhir (sampai hari ini jika bulan ini)
  const allCashflow = chartData?.daily_cashflow || []
  const todayISO = new Date().toISOString().split('T')[0]
  const todayIndex = allCashflow.findIndex(d => d.date === todayISO)
  
  const trend = todayIndex !== -1 
    ? allCashflow.slice(Math.max(0, todayIndex - 6), todayIndex + 1)
    : allCashflow.slice(-7)

  const chartLabels = trend.map(d => new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' }))
  const chartIncome = trend.map(d => d.income)
  const chartExpense = trend.map(d => d.expense)

  // Pie Chart: Map category_breakdown
  const pieCategories = (chartData?.category_breakdown || []).map(c => ({
    label: c.name,
    value: c.total
  }))

  // Budget Progress: Map dari dashboard summary
  const mappedBudgets = (data?.budgets || []).map(b => ({
    id: b.id,
    name: b.name,
    spent: b.spent,
    limit: b.amount,
  }))

  // ── Error State ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 gap-4">
        <div className="bg-red-50 border-4 border-red-500 shadow-[4px_4px_0px_0px_#000] p-5 w-full max-w-sm text-center rounded-none">
          <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
          <p className="font-black text-red-600 uppercase text-sm">Gagal memuat data</p>
          <button onClick={refetch} className="mt-4 px-6 py-3 bg-black text-white font-black text-xs uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_#555] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#555] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-5 pb-24 flex flex-col gap-5 font-sans relative">

      {/* Sapaan */}
      <div className="text-left">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          Ringkasan Keuangan
        </p>
        <h1 className="text-2xl font-black text-black leading-tight mt-0.5 uppercase tracking-tight">
          Halo, {user?.name?.split(' ')[0] || 'Tamu'}
        </h1>
      </div>

      {/* Saldo Total - Desain Retro Hitam Kuning */}
      <div className="bg-black border-4 border-black shadow-[6px_6px_0px_0px_#FAFF00] p-5 text-left rounded-none">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-black uppercase tracking-widest text-white/50">
            Total Saldo
          </p>
          <Wallet size={16} className="text-[#FAFF00]/50" />
        </div>
        {isLoading ? (
          <Skeleton className="h-9 w-48 mt-1 bg-white/10 rounded-none" />
        ) : (
          <p className="text-3xl font-black text-[#FAFF00] tracking-tight">
            {formatIDR(data?.total_balance)}
          </p>
        )}
        <p className="text-[10px] font-black text-white/40 mt-2 uppercase tracking-widest">
          Per hari ini • {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Pemasukan & Pengeluaran Grid */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard 
          label="Pemasukan"   
          value={data?.income_this_month}   
          icon={TrendingUp}   
          bg="bg-green-50" 
          isLoading={isLoading}
        />
        <SummaryCard 
          label="Pengeluaran" 
          value={data?.expense_this_month}  
          icon={TrendingDown} 
          bg="bg-red-50"   
          isLoading={isLoading}
        />
      </div>

      {/* ── Charts & Progress ────────────────────────────────────────── */}
      {isChartLoading ? (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[280px] border-4 border-black" />
          <Skeleton className="h-[350px] border-4 border-black" />
          <Skeleton className="h-48 border-4 border-black" />
        </div>
      ) : (
        <>
          <TrendChart 
            labels={chartLabels.length > 0 ? chartLabels : undefined}
            income={chartIncome.length > 0 ? chartIncome : undefined}
            expense={chartExpense.length > 0 ? chartExpense : undefined}
          />
          <CategoryPieChart 
            categories={pieCategories.length > 0 ? pieCategories : undefined}
          />
          <BudgetProgress 
            budgets={mappedBudgets.length > 0 ? mappedBudgets : undefined} 
          />
        </>
      )}

      {/* Floating Action Button */}
      <FAB onClick={() => setModalOpen(true)} />

      {/* Fast Add Modal */}
      <FastAddModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  )
}
