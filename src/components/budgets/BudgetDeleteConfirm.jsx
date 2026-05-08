// src/components/budgets/BudgetDeleteConfirm.jsx
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

export default function BudgetDeleteConfirm({ isOpen, budgetId, isLoading, onConfirm, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        role="dialog"
        aria-modal="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-sm bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 animate-in zoom-in duration-200 rounded-none"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-red-100 border-2 border-black flex items-center justify-center rounded-none">
            <AlertTriangle size={24} strokeWidth={3} className="text-red-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-black mb-2">
              Hapus Anggaran?
            </h3>
            <p className="text-sm font-black text-gray-400 uppercase tracking-tight">
              Tindakan ini tidak dapat dibatalkan. Pengeluaran yang sudah dicatat tidak akan terhapus, hanya batas anggaran yang dihilangkan.
            </p>
          </div>
          
          <div className="flex gap-3 w-full mt-2">
            <Button 
              variant="secondary" 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 uppercase shadow-[4px_4px_0px_0px_#000]"
            >
              Batal
            </Button>
            <Button 
              variant="danger" 
              onClick={() => onConfirm(budgetId)}
              loading={isLoading}
              className="flex-1 uppercase shadow-[4px_4px_0px_0px_#000]"
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
