// src/components/shared/TransactionItem.jsx
// Satu baris transaksi dengan gaya Neobrutalism: border hitam, tap area besar, badge tipe berwarna.
// Menerima onEdit dan onDelete callbacks dari halaman induk.

import { Pencil, Trash2 } from 'lucide-react'

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0)

const TYPE_CONFIG = {
  income: {
    label: 'Masuk',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-400',
    prefix: '+',
  },
  expense: {
    label: 'Keluar',
    textColor: 'text-red-600',
    badgeBg: 'bg-red-400',
    prefix: '-',
  },
  transfer: {
    label: 'Transfer',
    textColor: 'text-blue-600',
    badgeBg: 'bg-blue-400',
    prefix: '',
  },
}

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const config = TYPE_CONFIG[transaction.type] ?? TYPE_CONFIG.expense
  const categoryName = transaction.category?.name ?? 'Tanpa Kategori'
  const accountName = transaction.account?.name ?? '-'

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 px-3 py-3 text-left rounded-none">
      {/* Type badge — kotak warna solid */}
      <div
        className={`
          flex-shrink-0 w-2 self-stretch
          ${config.badgeBg} border-r-2 border-black
        `}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-black text-black truncate leading-tight">
          {transaction.description ?? categoryName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {categoryName}
          </span>
          <span className="text-[10px] text-gray-300 font-black">•</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">
            {accountName}
          </span>
        </div>
        {/* Tags jika ada */}
        {transaction.tags?.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {transaction.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-gray-100 border-2 border-black rounded-none"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p className={`text-base font-black ${config.textColor} leading-tight`}>
          {config.prefix}{formatIDR(transaction.amount)}
        </p>
        <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">
          {transaction.transaction_date
            ? new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
              })
            : ''}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 flex flex-col gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(transaction)
          }}
          aria-label="Edit transaksi"
          className="
            flex items-center justify-center w-8 h-8
            border-2 border-black bg-white rounded-none
            shadow-[3px_3px_0px_0px_#000]
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000]
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
            transition-all duration-100
          "
        >
          <Pencil size={12} strokeWidth={3} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(transaction)
          }}
          aria-label="Hapus transaksi"
          className="
            flex items-center justify-center w-8 h-8
            border-2 border-black bg-red-100 rounded-none
            shadow-[3px_3px_0px_0px_#000]
            hover:bg-red-500 hover:text-white
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000]
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
            transition-all duration-100
          "
        >
          <Trash2 size={12} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
