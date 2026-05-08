import { Pencil, Trash2, Scale } from 'lucide-react';
import AccountTypeBadge from './AccountTypeBadge';

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

export default function AccountCard({ account, onEdit, onDelete, onReconcile }) {
  return (
    <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col gap-4 rounded-none">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-black text-xl text-black truncate uppercase tracking-tight mb-1">
            {account.name}
          </h3>
          <AccountTypeBadge type={account.type} />
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onReconcile(account)}
            aria-label="Rekonsiliasi"
            title="Rekonsiliasi Saldo"
            className="flex items-center justify-center w-9 h-9 border-2 border-black rounded-none bg-blue-400 text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
          >
            <Scale size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onEdit(account)}
            aria-label="Edit akun"
            className="flex items-center justify-center w-9 h-9 border-2 border-black rounded-none bg-[#FAFF00] text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onDelete(account)}
            aria-label="Hapus akun"
            className="flex items-center justify-center w-9 h-9 border-2 border-black rounded-none bg-red-500 text-white shadow-[4px_4px_0px_0px_#000] hover:bg-red-600 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="mt-2 text-left bg-gray-50 border-2 border-black p-3 rounded-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Saldo Saat Ini</p>
        <p className="text-2xl font-black tracking-tight text-black">
          {formatIDR(account.balance)}
        </p>
      </div>
    </div>
  );
}
