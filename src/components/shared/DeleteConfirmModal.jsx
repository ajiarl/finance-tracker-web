// src/components/shared/DeleteConfirmModal.jsx
// Modal konfirmasi hapus transaksi bergaya Neobrutalism.
// Pola yang sama dengan FastAddModal: overlay gelap + panel bottom sheet.

import { Trash2 } from 'lucide-react'

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0)

export default function DeleteConfirmModal({ transaction, isLoading, onConfirm, onClose }) {
  if (!transaction) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Konfirmasi hapus transaksi"
        className="
          fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:bottom-auto md:w-[90%] md:max-w-sm z-[60]
          bg-white border-t-4 md:border-4 border-black
          shadow-[0_-8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[8px_8px_0px_0px_#000]
          flex flex-col animate-in slide-in-from-bottom md:zoom-in duration-300 rounded-none
        "
      >
        {/* Header merah */}
        <div className="bg-red-500 border-b-4 border-black px-4 py-3 flex items-center gap-3 rounded-none">
          <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0 rounded-none">
            <Trash2 size={16} className="text-red-500" />
          </div>
          <h2 className="text-white font-black text-base uppercase tracking-widest">
            Hapus Transaksi
          </h2>
        </div>

        {/* Body */}
        <div className="px-4 py-5 text-left">
          <p className="text-sm font-black text-black">
            Apakah kamu yakin ingin menghapus transaksi ini?
          </p>
          <div className="mt-3 border-2 border-black bg-gray-50 px-3 py-2.5 rounded-none">
            <p className="text-xs font-black text-black uppercase tracking-wide">
              {transaction.description ?? transaction.category?.name ?? 'Transaksi'}
            </p>
            <p className="text-lg font-black text-red-600 mt-0.5">
              {formatIDR(transaction.amount)}
            </p>
            <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">
              {transaction.transaction_date
                ? new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </p>
          </div>
          <p className="text-xs font-bold text-gray-500 mt-3 uppercase tracking-tight">
            Tindakan ini tidak bisa dibatalkan. Saldo akun akan otomatis disesuaikan.
          </p>
        </div>

        {/* Actions */}
        <div className="px-4 pb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              py-3 font-black text-sm uppercase tracking-widest
              border-2 border-black bg-white text-black rounded-none
              shadow-[4px_4px_0px_0px_#000]
              hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]
              active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
              transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="
              py-3 font-black text-sm uppercase tracking-widest
              border-2 border-black bg-red-500 text-white rounded-none
              shadow-[4px_4px_0px_0px_#000]
              hover:bg-red-600
              hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]
              active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
              transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? '...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </>
  )
}
