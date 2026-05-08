// src/components/budgets/BudgetEmptyState.jsx
import { Target } from 'lucide-react';

export default function BudgetEmptyState({ onAdd }) {
  return (
    <div className="border-4 border-dashed border-gray-300 p-8 text-center mt-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] rounded-none">
      <div className="w-16 h-16 border-4 border-black bg-[#FAFF00] shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mx-auto mb-4 rounded-none">
        <Target size={32} strokeWidth={3} className="text-black" />
      </div>
      <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">
        Belum Ada Anggaran
      </h3>
      <p className="text-sm font-black text-gray-400 mb-6 px-4 uppercase tracking-tight">
        Buat anggaran pertamamu untuk mengontrol pengeluaran dan mencapai target keuangan.
      </p>
      <button
        onClick={onAdd}
        className="px-8 py-4 bg-black text-white font-black text-sm uppercase tracking-widest border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#FAFF00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#FAFF00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
      >
        Buat Anggaran
      </button>
    </div>
  );
}
