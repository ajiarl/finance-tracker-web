import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const COMMON_ICONS = [
  'Utensils', 'Car', 'ShoppingBag', 'HeartPulse', 'FileText', 'Gamepad2', 'BookOpen', 
  'Briefcase', 'Laptop', 'TrendingUp', 'Gift', 'Home', 'Coffee', 'Plane', 'Dumbbell', 
  'Smartphone', 'Music', 'Camera', 'Shield', 'Trophy'
];

const COLORS = [
  '#F97316', '#3B82F6', '#EC4899', '#EF4444', '#8B5CF6', '#F59E0B', '#06B6D4', 
  '#22C55E', '#10B981', '#6366F1', '#84CC16', '#000000', '#6B7280', '#D1D5DB'
];

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Pilih tipe kategori' }),
  }),
  icon: z.string().min(1, 'Ikon wajib diisi'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus #RRGGBB'),
});

export default function CategoryFormModal({ isOpen, initialData, isLoading, onSubmit, onClose }) {
  const isEdit = !!initialData;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: 'Tag',
      color: '#3B82F6',
    },
  });

  const currentIcon = watch('icon');
  const currentColor = watch('color');
  const currentType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        icon: initialData.icon,
        color: initialData.color,
      });
    } else {
      reset({
        name: '',
        type: 'expense',
        icon: 'Tag',
        color: '#3B82F6',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden rounded-none">
        {/* Header */}
        <div className="bg-black text-white p-4 flex items-center justify-between border-b-4 border-black">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {isEdit ? 'Ubah Kategori' : 'Tambah Kategori'}
          </h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-200">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 border-2 border-black border-dashed">
            <div 
              className="w-16 h-16 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_#000]"
              style={{ backgroundColor: currentColor }}
            >
              {React.createElement(LucideIcons[currentIcon] || LucideIcons.Tag, { size: 32, strokeWidth: 3, className: 'text-black' })}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preview Visual</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-1">Nama Kategori</label>
              <input
                {...register('name')}
                placeholder="Misal: Freelance"
                className="w-full bg-white border-2 border-black p-3 font-bold shadow-[2px_2px_0px_0px_#000] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none outline-none transition-all rounded-none"
              />
              {errors.name && <p className="text-[10px] font-bold text-red-600 mt-1 uppercase">{errors.name.message}</p>}
            </div>

            {/* Type - Disabled in edit mode as per backend guidelines */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-1">Tipe</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isEdit}
                  onClick={() => setValue('type', 'income')}
                  className={`py-2 font-black uppercase text-xs border-2 border-black transition-all rounded-none ${
                    currentType === 'income' 
                      ? 'bg-green-400 shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]' 
                      : 'bg-white opacity-50'
                  } ${isEdit ? 'cursor-not-allowed' : ''}`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  disabled={isEdit}
                  onClick={() => setValue('type', 'expense')}
                  className={`py-2 font-black uppercase text-xs border-2 border-black transition-all rounded-none ${
                    currentType === 'expense' 
                      ? 'bg-red-400 shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]' 
                      : 'bg-white opacity-50'
                  } ${isEdit ? 'cursor-not-allowed' : ''}`}
                >
                  Pengeluaran
                </button>
              </div>
              {isEdit && <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase italic">Tipe tidak dapat diubah setelah dibuat.</p>}
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-1">Pilih Ikon</label>
              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 border-2 border-black bg-white shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                {COMMON_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setValue('icon', iconName)}
                    className={`flex items-center justify-center p-2 border-2 border-black transition-all rounded-none ${
                      currentIcon === iconName ? 'bg-[#FAFF00] shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {React.createElement(LucideIcons[iconName], { size: 18, strokeWidth: 2 })}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-1">Pilih Warna</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className={`w-8 h-8 border-2 border-black transition-all rounded-none ${
                      currentColor === color ? 'shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {currentColor === color && <Check size={16} className="mx-auto text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white p-4 font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#FAFF00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
          >
            {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
          </button>
        </form>
      </div>
    </div>
  );
}
