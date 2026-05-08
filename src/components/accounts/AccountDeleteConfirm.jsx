import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AccountDeleteConfirm({ account, isLoading, onConfirm, onClose }) {
  const [confirmText, setConfirmText] = useState('');

  if (!account) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-sm bg-red-600 border-4 border-black shadow-[8px_8px_0px_0px_#000] p-5 text-left flex flex-col gap-4 animate-in zoom-in-95 duration-200 rounded-none">
        
        <div className="flex items-center gap-3 border-b-4 border-black pb-3 rounded-none">
          <div className="bg-black p-2 flex-shrink-0 rounded-none">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h2 className="text-xl font-black uppercase text-white tracking-widest leading-none">
            ZONA BERBAHAYA
          </h2>
        </div>

        <div>
          <p className="text-white font-bold text-sm mb-2">
            Anda akan menghapus akun <span className="bg-black px-1.5 py-0.5 text-red-500 uppercase rounded-none">{account.name}</span> secara permanen.
          </p>
          <div className="bg-black text-white p-3 border-2 border-white mb-3 rounded-none">
            <p className="text-xs font-black uppercase text-red-500 tracking-wider mb-1">PERINGATAN KRITIS</p>
            <p className="text-sm font-black">
              Menghapus akun ini AKAN MENGHAPUS SELURUH TRANSAKSI di dalamnya. Saldo dan dashboard Anda akan berubah drastis! Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
            Ketik "HAPUS" untuk konfirmasi
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="HAPUS"
            className="w-full px-3 py-2 bg-white text-black font-black uppercase border-4 border-black rounded-none focus:outline-none focus:bg-red-50 focus:shadow-[4px_4px_0px_0px_#000] transition-all"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="py-3 bg-white text-black font-black uppercase tracking-widest border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== 'HAPUS' || isLoading}
            className="py-3 bg-black text-red-500 font-black uppercase tracking-widest border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 flex items-center justify-center gap-2"
          >
            {isLoading && <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />}
            {isLoading ? '...' : 'Eksekusi'}
          </button>
        </div>

      </div>
    </>
  );
}
