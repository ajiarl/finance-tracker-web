// src/components/shared/TransactionFilters.jsx
// Filter bar untuk halaman Transactions. Semua state filter dikelola di halaman induk.
// Design: collapsible panel bergaya Neobrutalism dengan toggle expand/collapse.

import { useState } from 'react'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

const TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'expense', label: 'Keluar' },
  { value: 'income', label: 'Masuk' },
  { value: 'transfer', label: 'Trf' },
]

export default function TransactionFilters({ filters, onChange, accounts = [], categories = [] }) {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = Object.values(filters).filter(Boolean).length

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const clearAll = () => {
    onChange({ type: '', account_id: '', category_id: '', date_from: '', date_to: '' })
  }

  const safeAccounts = Array.isArray(accounts) ? accounts : []
  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div className="border-2 border-black shadow-[4px_4px_0px_0px_#000] bg-white rounded-none">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="
          w-full flex items-center justify-between px-4 py-3
          font-black text-sm uppercase tracking-widest text-black rounded-none
          hover:bg-gray-50 transition-colors
        "
      >
        <div className="flex items-center gap-2">
          <Filter size={15} strokeWidth={3} />
          <span>Filter</span>
          {activeCount > 0 && (
            <span className="
              inline-flex items-center justify-center
              w-5 h-5 bg-black text-white
              text-[10px] font-black rounded-none
            ">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); clearAll() }}
              className="
                text-[10px] font-black uppercase underline
                text-gray-400 hover:text-red-500 transition-colors
              "
            >
              Reset
            </span>
          )}
          {isOpen ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
        </div>
      </button>

      {/* Filter content — collapsible */}
      {isOpen && (
        <div className="border-t-2 border-black px-4 py-4 grid grid-cols-2 gap-3 text-left">

          {/* Tipe */}
          <div className="col-span-2 text-left">
            <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1">
              Tipe Transaksi
            </label>
            <div className="flex border-2 border-black rounded-none overflow-hidden">
              {TYPE_OPTIONS.map(({ value, label }, idx, arr) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('type', value)}
                  className={[
                    'flex-1 py-2 text-[10px] font-black uppercase tracking-wide transition-colors duration-100 rounded-none',
                    filters.type === value
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-400 hover:text-gray-700',
                    idx < arr.length - 1 ? 'border-r-2 border-black' : '',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Akun */}
          <div className="text-left">
            <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1">
              Akun
            </label>
            <select
              value={filters.account_id}
              onChange={(e) => handleChange('account_id', e.target.value)}
              className="
                w-full px-2 py-2 bg-white text-black text-xs font-black uppercase tracking-tight
                border-2 border-black outline-none appearance-none cursor-pointer rounded-none
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow
              "
            >
              <option value="">Semua Akun</option>
              {safeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Kategori */}
          <div className="text-left">
            <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1">
              Kategori
            </label>
            <select
              value={filters.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              className="
                w-full px-2 py-2 bg-white text-black text-xs font-black uppercase tracking-tight
                border-2 border-black outline-none appearance-none cursor-pointer rounded-none
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow
              "
            >
              <option value="">Semua Kategori</option>
              {safeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Dari tanggal */}
          <div className="text-left">
            <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleChange('date_from', e.target.value)}
              className="
                w-full px-2 py-2 bg-white text-black text-xs font-black rounded-none
                border-2 border-black outline-none
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow
              "
            />
          </div>

          {/* Sampai tanggal */}
          <div className="text-left">
            <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleChange('date_to', e.target.value)}
              className="
                w-full px-2 py-2 bg-white text-black text-xs font-black rounded-none
                border-2 border-black outline-none
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow
              "
            />
          </div>
        </div>
      )}
    </div>
  )
}
