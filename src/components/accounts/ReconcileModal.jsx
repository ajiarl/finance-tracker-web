import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Scale } from 'lucide-react';
import Button from '../ui/Button';

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

const schema = z.object({
  actual_balance: z.string().min(1, 'Saldo aktual wajib diisi'),
});

export default function ReconcileModal({ account, isLoading, onReconcile, onClose }) {
  const [difference, setDifference] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { actual_balance: '' },
  });

  const actualValue = watch('actual_balance');

  useEffect(() => {
    if (account) {
      reset({ actual_balance: account.balance ? account.balance.toString() : '0' });
    }
  }, [account, reset]);

  useEffect(() => {
    if (account && actualValue) {
      const numericActual = parseFloat(actualValue.replace(/\D/g, '')) || 0;
      setDifference(numericActual - parseFloat(account.balance));
    } else {
      setDifference(0);
    }
  }, [actualValue, account]);

  const onSubmit = (data) => {
    const numericActual = parseFloat(data.actual_balance.replace(/\D/g, ''));
    if (isNaN(numericActual)) return;
    onReconcile({ actual_balance: numericActual });
  };

  if (!account) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
      <div className="
          fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:bottom-auto md:w-[90%] md:max-w-md z-[60]
          bg-white border-t-4 md:border-4 border-black
          shadow-[0_-8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[8px_8px_0px_0px_#000]
          flex flex-col max-h-[90vh] md:max-h-[calc(100vh-4rem)]
          animate-in slide-in-from-bottom md:zoom-in duration-300
        ">
        
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-blue-400 border-b-4 border-black rounded-none">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-black" />
            <h2 className="text-black font-black text-base uppercase tracking-widest text-left">
              Rekonsiliasi Saldo
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 border-2 border-black bg-white text-black rounded-none hover:bg-black hover:text-white transition-colors duration-100 disabled:opacity-50"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 text-left">
          <div className="bg-gray-50 border-2 border-black p-3 rounded-none">
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Saldo Tercatat ({account.name})</p>
            <p className="text-lg font-black">{formatIDR(account.balance)}</p>
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              Saldo Aktual (Fisik/Bank)
            </label>
            <Controller
              name="actual_balance"
              control={control}
              render={({ field: { onChange, value } }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={isLoading}
                  value={formatIDR(parseFloat(value?.replace(/\D/g, '')) || 0)}
                  onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3 py-3 bg-white text-black font-black text-xl border-4 border-black rounded-none outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow ${errors.actual_balance ? 'border-red-500 bg-red-50 focus:shadow-[4px_4px_0px_0px_rgb(239,68,68)]' : ''}`}
                />
              )}
            />
            {errors.actual_balance && <p className="mt-1 text-xs font-black text-red-500">{errors.actual_balance.message}</p>}
          </div>

          <div className={`p-3 border-2 border-black rounded-none ${difference === 0 ? 'bg-gray-100' : difference > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="text-[10px] font-black uppercase text-gray-600 mb-1">Preview Penyesuaian</p>
            {difference === 0 ? (
              <p className="text-sm font-black text-gray-600">Saldo sudah sesuai. Tidak ada transaksi yang akan dibuat.</p>
            ) : (
              <p className={`text-sm font-black ${difference > 0 ? 'text-green-700' : 'text-red-700'}`}>
                Sistem akan membuat transaksi {difference > 0 ? 'pemasukan' : 'pengeluaran'} sebesar <span className="font-black">{formatIDR(Math.abs(difference))}</span> untuk menyamakan saldo.
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit(onSubmit)}
            loading={isLoading}
            variant="primary"
            size="lg"
            className="w-full uppercase tracking-widest mt-2 h-14 shadow-[4px_4px_0px_0px_#000]"
          >
            {isLoading ? 'Memproses...' : 'Sesuaikan Saldo'}
          </Button>
        </div>
      </div>
    </>
  );
}
