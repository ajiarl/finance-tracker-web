import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { ACCOUNT_TYPE_MAP } from './AccountTypeBadge';

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255),
  type: z.enum(['cash', 'bank', 'e-wallet', 'credit', 'investment'], {
    errorMap: () => ({ message: 'Pilih tipe akun valid' }),
  }),
  balance: z.string().min(1, 'Saldo wajib diisi'),
});

export default function AccountFormModal({ isOpen, initialData, isLoading, onSubmit, onClose }) {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'cash', balance: '0' },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          type: initialData.type,
          balance: initialData.balance ? initialData.balance.toString() : '0',
        });
      } else {
        reset({ name: '', type: 'cash', balance: '0' });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = (data) => {
    const numericBalance = parseFloat(data.balance.replace(/\D/g, '')) || 0;
    const payload = {
      name: data.name,
      type: data.type,
      balance: numericBalance,
    };
    
    if (isEditMode) {
      onSubmit({ id: initialData.id, ...payload });
    } else {
      onSubmit(payload);
    }
  };

  if (!isOpen) return null;

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
        
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black">
          <h2 className="text-white font-black text-base uppercase tracking-widest text-left">
            {isEditMode ? 'Edit Akun' : 'Buat Akun Baru'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 border-2 border-white text-white rounded-none hover:bg-white hover:text-black transition-colors duration-100 disabled:opacity-50"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-left">
          
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              Nama Akun
            </label>
            <input
              type="text"
              placeholder="BCA, Mandiri, Gopay..."
              {...register('name')}
              disabled={isLoading}
              className={`w-full px-3 py-2.5 bg-white text-black font-black text-sm border-2 border-black rounded-none outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow ${errors.name ? 'border-red-500 bg-red-50 focus:shadow-[4px_4px_0px_0px_rgb(239,68,68)]' : ''}`}
            />
            {errors.name && <p className="mt-1 text-xs font-black text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              Tipe Akun
            </label>
            <select
              {...register('type')}
              disabled={isLoading}
              className={`w-full px-3 py-2.5 bg-white text-black font-black text-sm uppercase tracking-wider border-2 border-black rounded-none outline-none appearance-none cursor-pointer focus:shadow-[4px_4px_0px_0px_#000] transition-shadow ${errors.type ? 'border-red-500 bg-red-50 focus:shadow-[4px_4px_0px_0px_rgb(239,68,68)]' : ''}`}
            >
              {Object.entries(ACCOUNT_TYPE_MAP).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-xs font-black text-red-500">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              Saldo {isEditMode ? '' : 'Awal'} (IDR)
            </label>
            <Controller
              name="balance"
              control={control}
              render={({ field: { onChange, value } }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={isLoading}
                  value={formatIDR(parseFloat(value?.replace(/\D/g, '')) || 0)}
                  onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3 py-2.5 bg-white text-black font-black text-lg border-2 border-black rounded-none outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow ${errors.balance ? 'border-red-500 bg-red-50 focus:shadow-[4px_4px_0px_0px_rgb(239,68,68)]' : ''}`}
                />
              )}
            />
            {errors.balance && <p className="mt-1 text-xs font-black text-red-500">{errors.balance.message}</p>}
            {isEditMode && <p className="mt-1 text-[10px] font-black text-gray-500 uppercase">Mengubah saldo manual mungkin membuat riwayat transaksi tidak sinkron. Gunakan fitur rekonsiliasi jika perlu.</p>}
          </div>

          <Button
            onClick={handleSubmit(handleFormSubmit)}
            loading={isLoading}
            variant="primary"
            size="lg"
            className="w-full uppercase tracking-widest mt-2 h-14"
          >
            {isLoading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Buat Akun')}
          </Button>
        </div>
      </div>
    </>
  );
}
