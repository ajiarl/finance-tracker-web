// src/components/shared/BudgetProgress.jsx
import { Landmark, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBudgetProgress } from '../../hooks/useBudgets';
import { useNavigate } from 'react-router-dom';
import BudgetProgressBar from '../budgets/BudgetProgressBar';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val ?? 0);

function BudgetItem({ budget }) {
  const amount = Number(budget.amount) || 0;
  const spent = Number(budget.spent ?? budget.spent_amount) || 0;
  const percentage = budget.percentage_used ?? budget.percentage ?? (amount > 0 ? Math.round((spent / amount) * 100) : 0);
  const isOver = percentage > 100;
  
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-3 flex flex-col gap-2 text-left rounded-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 border-2 border-black bg-gray-100 rounded-none">
            <Landmark size={18} strokeWidth={3} className="text-black" />
          </span>
          <span className="font-black text-sm text-black truncate uppercase tracking-tight">
            {budget.name || 'Anggaran'}
          </span>
        </div>
        <span
          className={`
            flex-shrink-0 px-2 py-0.5 text-[10px] font-black border-2 border-black rounded-none uppercase tracking-wider
            ${isOver ? 'bg-red-500 text-white' : 'bg-black text-white'}
          `}
        >
          {percentage}%
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <BudgetProgressBar percentage={percentage} />
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase ${isOver ? 'text-red-600' : 'text-green-700'}`}>
            {isOver ? 'Batas terlampaui' : `Terpakai ${formatIDR(spent)}`}
          </span>
          <span className="text-[10px] font-black text-gray-400 uppercase">
            Limit {formatIDR(amount)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BudgetProgress() {
  const navigate = useNavigate();
  // Gunakan period bulan berjalan sebagai default untuk dashboard
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data: budgets = [], isLoading } = useBudgetProgress(currentMonth);

  if (isLoading) {
    return (
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-4 text-left animate-pulse rounded-none">
        <div className="h-6 bg-gray-200 w-1/3 mb-4 rounded-none" />
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 w-full rounded-none" />
          <div className="h-20 bg-gray-200 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return null; // Sembunyikan sepenuhnya jika tidak ada anggaran
  }

  const overCount = budgets.filter((b) => b.percentage > 90).length;

  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] text-left rounded-none">
      <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-white rounded-none">
        <h3 className="font-black text-sm uppercase tracking-widest text-black">
          Anggaran Bulan Ini
        </h3>
        {overCount > 0 ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black bg-red-500 text-white border-2 border-black rounded-none uppercase tracking-wider">
            <AlertTriangle size={12} strokeWidth={3} />
            {overCount} Peringatan
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black bg-green-400 text-black border-2 border-black rounded-none uppercase tracking-wider">
            <CheckCircle2 size={12} strokeWidth={3} />
            Aman
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {budgets.slice(0, 3).map((budget) => (
          <BudgetItem key={budget.id} budget={budget} />
        ))}

        <button
          onClick={() => navigate('/budgets')}
          className="
            w-full py-3 mt-1 font-black text-xs uppercase tracking-widest text-black rounded-none
            bg-[#FAFF00] border-2 border-black shadow-[4px_4px_0px_0px_#000]
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]
            active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
            transition-all duration-100
          "
        >
          Kelola Anggaran
        </button>
      </div>
    </div>
  );
}
