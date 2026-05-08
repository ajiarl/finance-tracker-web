// src/components/budgets/BudgetCard.jsx
import { Pencil, Trash2 } from 'lucide-react';
import BudgetProgressBar from './BudgetProgressBar';

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const amount = Number(budget.amount) || 0;
  const spent = Number(budget.spent ?? budget.spent_amount) || 0;
  const percentage = budget.percentage_used ?? budget.percentage ?? (amount > 0 ? Math.round((spent / amount) * 100) : 0);
  const remaining = budget.remaining_amount ?? (amount - spent);

  return (
    <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col gap-3 text-left rounded-none">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-black text-lg text-black truncate uppercase tracking-tight">
            {budget.name || 'Budget Umum'}
          </h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-0.5">
            {budget.period === 'monthly' ? 'Bulanan' : budget.period} • {budget.start_date ? budget.start_date.slice(0,7) : ''}
          </p>
        </div>
        
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={() => onEdit(budget)}
            aria-label="Edit budget"
            className="flex items-center justify-center w-9 h-9 border-2 border-black rounded-none bg-[#FAFF00] text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
          >
            <Pencil size={16} strokeWidth={3} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            aria-label="Hapus budget"
            className="flex items-center justify-center w-9 h-9 border-2 border-black rounded-none bg-red-500 text-white shadow-[4px_4px_0px_0px_#000] hover:bg-red-600 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
          >
            <Trash2 size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-black">{formatIDR(spent)}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase">DARI {formatIDR(amount)}</span>
        </div>
        <BudgetProgressBar percentage={percentage} />
        <p className="text-[10px] font-black mt-1 text-right text-gray-400 uppercase tracking-tight">
          Sisa: {formatIDR(remaining)} ({percentage}%)
        </p>
      </div>
    </div>
  );
}
