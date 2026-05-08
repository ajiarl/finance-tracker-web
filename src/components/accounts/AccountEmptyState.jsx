import { Wallet } from 'lucide-react';

export default function AccountEmptyState({ onAdd }) {
  return (
    <div className="border-4 border-dashed border-gray-300 p-8 text-center mt-4 rounded-none">
      <div className="w-16 h-16 border-4 border-black bg-[#FAFF00] shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mx-auto mb-4 rounded-none">
        <Wallet size={28} strokeWidth={3} className="text-black" />
      </div>
      <p className="text-base font-black uppercase text-black mb-2">
        Belum ada akun
      </p>
      <p className="text-xs text-gray-400 font-black uppercase tracking-tight mb-6">
        Tambahkan dompet, rekening bank, atau e-wallet untuk mulai melacak keuangan Anda.
      </p>
      <button
        onClick={onAdd}
        className="
          px-8 py-4 bg-black text-white font-black text-sm uppercase tracking-widest rounded-none
          border-2 border-black shadow-[4px_4px_0px_0px_#555]
          hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#555]
          active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
          transition-all duration-100
        "
      >
        Tambah Akun
      </button>
    </div>
  );
}
