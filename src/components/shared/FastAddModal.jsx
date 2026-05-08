// src/components/shared/FastAddModal.jsx
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createTransaction, getCategories, getAccounts } from '../../api/transactions'
import Input from '../ui/Input'
import Button from '../ui/Button'

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)

const PRESETS = [5000, 10000, 25000, 50000, 100000]
const todayISO = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Jumlah wajib diisi' })
    .positive('Jumlah harus lebih dari 0'),
  type: z.enum(['expense', 'income']),
  category_id: z.string().min(1, 'Pilih kategori'),
  account_id: z.string().min(1, 'Pilih akun'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  notes: z.string().max(255).optional(),
})

export default function FastAddModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })
  const { data: accountsRes } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    staleTime: 5 * 60 * 1000,
  })

  const categories = categoriesRes?.data?.data ?? []
  const accounts   = accountsRes?.data?.data   ?? []

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
      type: 'expense',
      date: todayISO(),
      amount: undefined,
      category_id: '',
      account_id: '',
      notes: '',
    },
  })

  const currentType   = watch('type')
  const currentAmount = watch('amount')

  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'expense',
        date: todayISO(),
        amount: undefined,
        category_id: '',
        account_id: '',
        notes: '',
      })
    }
  }, [isOpen, reset])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      onClose()
    },
  })

  const onSubmit = (data) => mutate(data)

  if (!isOpen) return null

  return (
    <>
      {/* ✅ FIX 1: z-[60] agar menimpa BottomNav yang z-50 */}
      <div
        className="fixed inset-0 z-[60] bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ✅ FIX 2: z-[60] dan max-h dikurangi tinggi BottomNav (4rem = 64px) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tambah transaksi cepat"
        className="
          fixed bottom-0 left-0 right-0 z-[60]
          bg-white border-t-4 border-black
          shadow-[0_-6px_0px_0px_#000]
          flex flex-col
          max-h-[calc(100vh-4rem)]
        "
      >
        {/* Header — sticky di dalam panel */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black">
          <h2 className="text-white font-black text-base uppercase tracking-widest">
            Tambah Transaksi
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="
              flex items-center justify-center w-8 h-8
              border-2 border-white text-white
              hover:bg-white hover:text-black
              transition-colors duration-100
            "
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ✅ FIX 3: overflow-y-auto hanya pada area konten, pb-6 cukup karena
            modal sudah berhenti di atas BottomNav */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-5 text-left">

          {isError && (
            <div className="px-3 py-2.5 bg-red-50 border-2 border-red-500 text-red-600 text-sm font-semibold">
              {error?.response?.data?.message ?? 'Gagal menyimpan. Coba lagi.'}
            </div>
          )}

          {/* Toggle Tipe */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="flex border-2 border-black shadow-[4px_4px_0px_#000]">
                {[
                  { val: 'expense', label: 'Pengeluaran', activeClass: 'bg-red-500 text-white' },
                  { val: 'income',  label: 'Pemasukan',   activeClass: 'bg-green-500 text-white' },
                ].map(({ val, label, activeClass }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => field.onChange(val)}
                    className={[
                      'flex-1 py-2.5 font-black text-sm uppercase tracking-widest transition-colors duration-100',
                      field.value === val
                        ? activeClass
                        : 'bg-white text-gray-400 hover:text-gray-600',
                      val === 'expense' ? 'border-r-2 border-black' : '',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          />

          {/* Preset Amount */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-black mb-2">
              Pilih Nominal Cepat
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue('amount', preset, { shouldValidate: true })}
                  className={[
                    'px-3 py-1.5 text-xs font-bold border-2 border-black transition-all duration-100',
                    currentAmount === preset
                      ? 'bg-[#FAFF00] shadow-none translate-x-[2px] translate-y-[2px]'
                      : 'bg-white shadow-[3px_3px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                  ].join(' ')}
                >
                  {formatIDR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-bold uppercase tracking-wider text-black mb-1"
            >
              Jumlah (IDR)
            </label>
            <input
              id="amount"
              type="number"
              inputMode="numeric"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
              className={[
                'w-full px-3 py-2.5 bg-white text-black font-bold text-lg',
                'border-2 border-black outline-none',
                'placeholder:text-gray-300',
                'focus:shadow-[3px_3px_0px_0px_#000] transition-shadow duration-100',
                errors.amount ? 'border-red-500 bg-red-50' : '',
              ].join(' ')}
            />
            {errors.amount && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-bold uppercase tracking-wider text-black mb-1"
            >
              Kategori
            </label>
            <select
              id="category_id"
              {...register('category_id')}
              className={[
                'w-full px-3 py-2.5 bg-white text-black font-medium',
                'border-2 border-black outline-none appearance-none cursor-pointer',
                'focus:shadow-[3px_3px_0px_0px_#000] transition-shadow duration-100',
                errors.category_id ? 'border-red-500 bg-red-50' : '',
              ].join(' ')}
            >
              <option value="">-- Pilih Kategori --</option>
              {categories
                .filter((c) => !c.type || c.type === currentType)
                .map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Akun */}
          <div>
            <label
              htmlFor="account_id"
              className="block text-sm font-bold uppercase tracking-wider text-black mb-1"
            >
              Akun
            </label>
            <select
              id="account_id"
              {...register('account_id')}
              className={[
                'w-full px-3 py-2.5 bg-white text-black font-medium',
                'border-2 border-black outline-none appearance-none cursor-pointer',
                'focus:shadow-[3px_3px_0px_0px_#000] transition-shadow duration-100',
                errors.account_id ? 'border-red-500 bg-red-50' : '',
              ].join(' ')}
            >
              <option value="">-- Pilih Akun --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={String(acc.id)}>
                  {acc.name}
                </option>
              ))}
            </select>
            {errors.account_id && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.account_id.message}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <Input
            id="date"
            label="Tanggal"
            type="date"
            error={errors.date}
            registration={register('date')}
          />

          {/* Catatan */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-bold uppercase tracking-wider text-black mb-1"
            >
              Catatan{' '}
              <span className="font-normal text-gray-400 normal-case">(opsional)</span>
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Makan siang, bensin, dll"
              {...register('notes')}
              className="
                w-full px-3 py-2.5 bg-white text-black font-medium
                border-2 border-black outline-none resize-none
                placeholder:text-gray-300
                focus:shadow-[3px_3px_0px_0px_#000] transition-shadow duration-100
              "
            />
          </div>

          {/* Submit — berada di dalam scroll area, selalu terjangkau */}
          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
            className="w-full uppercase tracking-widest"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </div>
      </div>
    </>
  )
}
