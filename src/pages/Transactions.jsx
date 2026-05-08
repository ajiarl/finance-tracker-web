// src/pages/Transactions.jsx
// Halaman daftar transaksi dengan filter bar, grouping per tanggal, edit & delete.
// Semua state filter lokal; data di-fetch ulang saat filter berubah via queryKey.

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Receipt } from 'lucide-react'

import {
  getTransactions,
  getAccounts,
  getCategories,
  deleteTransaction,
} from '../api/transactions'
import TransactionItem from '../components/shared/TransactionItem'
import TransactionFilters from '../components/shared/TransactionFilters'
import DeleteConfirmModal from '../components/shared/DeleteConfirmModal'
import EditTransactionModal from '../components/shared/EditTransactionModal'
import { FAB } from './Dashboard'
import FastAddModal from '../components/shared/FastAddModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0)

/**
 * Kelompokkan array transaksi berdasarkan transaction_date.
 * Return: [{ date: string, items: Transaction[] }]
 */
function groupByDate(transactions = []) {
  if (!Array.isArray(transactions)) return []
  const map = new Map()
  for (const trx of transactions) {
    const key = trx.transaction_date ?? 'Tanpa Tanggal'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(trx)
  }
  // Urutkan key descending (terbaru dulu)
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }))
}

function formatGroupDate(dateStr) {
  if (!dateStr || dateStr === 'Tanpa Tanggal') return 'Tanpa Tanggal'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-20 border-2 border-black rounded-none" />
      ))}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilter }) {
  return (
    <div className="border-4 border-dashed border-gray-300 p-8 text-center mt-4 rounded-none">
      <div className="w-12 h-12 border-4 border-gray-300 bg-gray-100 flex items-center justify-center mx-auto mb-3 rounded-none">
        <Receipt size={22} className="text-gray-300" />
      </div>
      <p className="text-sm font-black uppercase text-gray-400">
        {hasFilter ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
      </p>
      {!hasFilter && (
        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">
          Tap tombol + untuk menambah transaksi pertama
        </p>
      )}
    </div>
  )
}

// ── Komponen Utama ────────────────────────────────────────────────────────────
const INITIAL_FILTERS = {
  type: '',
  account_id: '',
  category_id: '',
  date_from: '',
  date_to: '',
}

export default function Transactions() {
  const queryClient = useQueryClient()

  // Filter state
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  // Modal state
  const [isAddOpen,    setIsAddOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)  // Transaction | null
  const [deleteTarget, setDeleteTarget] = useState(null)  // Transaction | null

  // ── Data fetching ───────────────────────────────────────────────────────
  const { data: transactions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      )
      return getTransactions(cleanParams)
    },
    staleTime: 1000 * 60,
  })

  const { data: accountsData = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    staleTime: 5 * 60 * 1000,
  })

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })

  // ── Mutations ───────────────────────────────────────────────────────────
  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      setDeleteTarget(null)
    },
  })

  // ── Derived data ────────────────────────────────────────────────────────
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const grouped = groupByDate(safeTransactions)
  const hasActiveFilter = Object.values(filters).some(Boolean)

  const totalIncome   = safeTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalExpense  = safeTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 gap-4">
        <div className="bg-red-50 border-4 border-red-500 p-5 w-full max-w-sm text-center rounded-none shadow-[4px_4px_0px_0px_#000]">
          <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
          <p className="font-black text-red-600 uppercase text-sm">Gagal memuat transaksi</p>
        </div>
        <button
          onClick={refetch}
          className="
            px-6 py-3 bg-black text-white font-black text-sm uppercase tracking-widest
            border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#555]
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#555]
            active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
            transition-all duration-100
          "
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4 relative">

      {/* Page Header */}
      <div className="text-left">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          Riwayat
        </p>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">
          Transaksi
        </h1>
      </div>

      {/* Filter Bar */}
      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        accounts={Array.isArray(accountsData) ? accountsData : []}
        categories={Array.isArray(categoriesData) ? categoriesData : []}
      />

      {/* Ringkasan hasil filter */}
      {!isLoading && safeTransactions.length > 0 && (
        <div className="flex gap-2">
          <div className="flex-1 border-2 border-black bg-green-50 px-3 py-2 text-left shadow-[4px_4px_0px_0px_#000] rounded-none">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              Total Masuk
            </p>
            <p className="text-sm font-black text-green-700">
              +{formatIDR(totalIncome)}
            </p>
          </div>
          <div className="flex-1 border-2 border-black bg-red-50 px-3 py-2 text-left shadow-[4px_4px_0px_0px_#000] rounded-none">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              Total Keluar
            </p>
            <p className="text-sm font-black text-red-600">
              -{formatIDR(totalExpense)}
            </p>
          </div>
        </div>
      )}

      {/* Daftar transaksi */}
      {isLoading ? (
        <SkeletonList />
      ) : safeTransactions.length === 0 ? (
        <EmptyState hasFilter={hasActiveFilter} />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, items }) => (
            <section key={date}>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-black px-2 py-1 rounded-none">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">
                    {formatGroupDate(date)}
                  </p>
                </div>
                <div className="flex-1 h-0.5 bg-black" />
                <p className="text-[10px] font-black uppercase text-gray-400">
                  {items.length} TRX
                </p>
              </div>

              <div className="space-y-3">
                {items.map((trx) => (
                  <TransactionItem
                    key={trx.id}
                    transaction={trx}
                    onEdit={(t) => setEditTarget(t)}
                    onDelete={(t) => setDeleteTarget(t)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* FAB */}
      <FAB onClick={() => setIsAddOpen(true)} />

      {/* Modals */}
      <FastAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {editTarget && (
        <EditTransactionModal
          transaction={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          transaction={deleteTarget}
          isLoading={isDeleting}
          onConfirm={() => doDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
