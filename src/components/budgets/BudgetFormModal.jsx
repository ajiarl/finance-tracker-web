// src/components/budgets/BudgetFormModal.jsx
import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../api/transactions';
import Button from '../ui/Button';

const schema = z.object({
  category_id: z.string().min(1, 'Pilih kategori'),
  name: z.string().min(1, 'Nama anggaran wajib diisi'),
  amount: z.string().min(1, 'Nominal wajib diisi'),
  period: z.string().min(1, 'Periode wajib diisi'),
  period_type: z.string().default('monthly'),
});

const formatIDR = (val) => {
  if (!val) return '';
  const numberString = val.toString().replace(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(numberString);
};

export default function BudgetFormModal({ isOpen, initialData, onClose, onSubmit, isPending, serverError }) {
  const isEditMode = !!initialData;

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const categories = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData.filter(c => c.type === 'expense') : [];
  }, [categoriesData]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: '',
      name: '',
      amount: '',
      period: new Date().toISOString().slice(0, 7),
      period_type: 'monthly',
    },
  });

  // Prefill form
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          category_id: String(initialData.category_id || ''),
          name: initialData.name || '',
          amount: initialData.amount ? initialData.amount.toString() : '',
          period: initialData.start_date ? initialData.start_date.slice(0, 7) : new Date().toISOString().slice(0, 7),
          period_type: initialData.period || 'monthly',
        });
      } else {
        reset({
          category_id: '',
          name: '',
          amount: '',
          period: new Date().toISOString().slice(0, 7),
          period_type: 'monthly',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  // Autofill name from category selection
  const selectedCategoryId = watch('category_id');
  useEffect(() => {
    if (isOpen && !isEditMode && selectedCategoryId) {
      const selectedCat = categories.find(c => String(c.id) === selectedCategoryId);
      if (selectedCat) {
        setValue('name', selectedCat.name, { shouldValidate: true });
      }
    }
  }, [selectedCategoryId, isOpen, isEditMode, categories, setValue]);

  // Close with Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleFormSubmit = (data) => {
    const numericAmount = parseFloat(data.amount.replace(/\D/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Nominal harus lebih dari 0");
      return;
    }

    // Convert 'YYYY-MM' from data.period input to start_date and end_date
    const [year, month] = data.period.split('-');
    const startDate = `${year}-${month}-01`;
    // Get last day of month
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    const payload = {
      name: data.name,
      category_id: isEditMode ? initialData.category_id : (data.category_id ? Number(data.category_id) : null),
      amount: numericAmount,
      period: 'monthly',
      start_date: startDate,
      end_date: endDate,
      is_active: true,
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
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditMode ? 'Edit Anggaran' : 'Tambah Anggaran'}
        className="
          fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:bottom-auto md:w-[90%] md:max-w-md z-[60]
          bg-white border-t-4 md:border-4 border-black
          shadow-[0_-8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[8px_8px_0px_0px_#000]
          flex flex-col max-h-[calc(100vh-4rem)]
          animate-in slide-in-from-bottom md:zoom-in duration-300
        "
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black">
          <h2 className="text-white font-black text-base uppercase tracking-widest text-left">
            {isEditMode ? 'Edit Anggaran' : 'Buat Anggaran Baru'}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 border-2 border-white text-white rounded-none hover:bg-white hover:text-black transition-colors"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5 text-left">
          {serverError && (
            <div className="p-3 bg-red-50 border-2 border-red-500 text-red-600 text-xs font-black rounded-none">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Kategori
            </label>
            {categories.length === 0 ? (
              <div className="p-3 bg-yellow-50 border-2 border-black text-black text-xs font-black shadow-[4px_4px_0px_0px_#000] rounded-none">
                Belum ada kategori pengeluaran. Harap buat kategori terlebih dahulu di menu Pengaturan.
              </div>
            ) : (
              <>
                <select
                  {...register('category_id')}
                  disabled={isEditMode}
                  className={`
                    w-full px-4 py-3 bg-white border-2 border-black font-black text-sm uppercase tracking-wider outline-none appearance-none cursor-pointer rounded-none
                    focus:shadow-[4px_4px_0px_0px_#000] transition-shadow
                    ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                  `}
                >
                  <option value="">-- Pilih Kategori Pengeluaran --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs font-black mt-1">{errors.category_id.message}</p>}
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Nama Anggaran
            </label>
            <input
              type="text"
              placeholder="Contoh: Makan Siang Harian"
              {...register('name')}
              className="w-full px-4 py-3 bg-white border-2 border-black font-black text-sm outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow rounded-none"
            />
            {errors.name && <p className="text-red-500 text-xs font-black mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Batas Pengeluaran (Rp)
            </label>
            <Controller
              name="amount"
              control={control}
              render={({ field: { onChange, value } }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatIDR(value)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    onChange(rawValue);
                  }}
                  className="w-full px-4 py-3 bg-white text-black font-black text-xl border-2 border-black outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow rounded-none"
                />
              )}
            />
            {errors.amount && <p className="text-red-500 text-xs font-black mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Periode
            </label>
            <input
              type="month"
              {...register('period')}
              className="w-full px-4 py-3 bg-white border-2 border-black font-black text-sm outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-shadow rounded-none"
            />
            {errors.period && <p className="text-red-500 text-xs font-black mt-1">{errors.period.message}</p>}
          </div>
          
        </div>

        <div className="flex-shrink-0 px-4 pb-6 pt-2 bg-white">
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            loading={isPending}
            variant="primary"
            className="w-full h-14 text-base uppercase tracking-widest shadow-[4px_4px_0px_0px_#000]"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Anggaran'}
          </Button>
        </div>
      </div>
    </>
  );
}
