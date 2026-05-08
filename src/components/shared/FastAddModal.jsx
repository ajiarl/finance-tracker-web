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
  type: z.enum(['expense', 'income', 'transfer']),
  category_id: z.string().optional(),
  account_id: z.string().min(1, 'Pilih akun'),
  transaction_date: z.string().min(1, 'Tanggal wajib diisi'),
  notes: z.string().optional(),
})

export default function FastAddModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  const { data: accountsData = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : []
  const accounts = Array.isArray(accountsData) ? accountsData : []

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
      amount: undefined,
      type: 'expense',
      category_id: '',
      account_id: '',
      transaction_date: todayISO(),
      notes: '',
    },
  })

  const currentAmount = watch('amount')
  const currentType = watch('type')

  useEffect(() => {
    if (isOpen) {
      reset({
        amount: undefined,
        type: 'expense',
        category_id: '',
        account_id: accounts.length > 0 ? String(accounts[0].id) : '',
        transaction_date: todayISO(),
        notes: '',
      })
    }
  }, [isOpen, reset, accounts])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      onClose()
    },
  })

  const onSubmit = (data) => {
    mutate({
      ...data,
      category_id: data.category_id ? Number(data.category_id) : null,
      account_id: Number(data.account_id),
    })
  }

  if (!isOpen) return null

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
        aria-label="Tambah transaksi cepat"
        className="
          fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:bottom-auto md:w-[90%] md:max-w-md z-[60]
          bg-white border-t-4 md:border-4 border-black
          shadow-[0_-8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[8px_8px_0px_0px_#000]
          flex flex-col max-h-[90vh] md:max-h-[calc(100vh-4rem)]
          animate-in slide-in-from-bottom md:zoom-in duration-300
        "
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black">
          <h2 className="text-white font-black text-base uppercase tracking-widest text-left">
            Tambah Transaksi
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 border-2 border-white text-white rounded-none hover:bg-white hover:text-black transition-colors"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 text-left">
          {isError && (
            <div className="p-3 bg-red-50 border-2 border-red-500 text-red-600 text-xs font-black rounded-none">
              {error?.response?.data?.message || 'Gagal menyimpan transaksi'}
            </div>
          )}

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="flex border-4 border-black shadow-[4px_4px_0px_#000] rounded-none overflow-hidden">
                {[
                  { val: 'expense', label: 'Keluar', active: 'bg-red-500 text-white' },
                  { val: 'income', label: 'Masuk', active: 'bg-green-500 text-white' },
                  { val: 'transfer', label: 'Trf', active: 'bg-blue-500 text-white' },
                ].map((t, idx, arr) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => field.onChange(t.val)}
                    className={`
                      flex-1 py-3 font-black text-xs uppercase tracking-widest transition-colors rounded-none
                      ${field.value === t.val ? t.active : 'bg-white text-gray-400 hover:text-gray-600'}
                      ${idx < arr.length - 1 ? 'border-r-4 border-black' : ''}
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          />

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Jumlah (IDR)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                {...register('amount', { valueAsNumber: true })}
                className={`
                  w-full px-4 py-4 bg-white text-black font-black text-2xl rounded-none
                  border-2 border-black outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow
                  ${errors.amount ? 'border-red-500 bg-red-50' : ''}
                `}
              />
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setValue('amount', p, { shouldValidate: true })}
                    className="
                      px-3 py-1.5 border-2 border-black bg-white text-[10px] font-black uppercase rounded-none
                      shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]
                      active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100
                    "
                  >
                    {formatIDR(p)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Kategori
            </label>
            <select
              {...register('category_id')}
              className="w-full px-4 py-3 bg-white border-2 border-black font-black text-sm uppercase tracking-wider outline-none appearance-none cursor-pointer rounded-none"
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
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Akun
            </label>
            <select
              {...register('account_id')}
              className="w-full px-4 py-3 bg-white border-2 border-black font-black text-sm uppercase tracking-wider outline-none appearance-none cursor-pointer rounded-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={String(acc.id)}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal"
              type="date"
              registration={register('transaction_date')}
              error={errors.transaction_date}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Catatan (opsional)
            </label>
            <textarea
              {...register('notes')}
              placeholder="Makan siang, bensin, dll"
              className="w-full px-4 py-3 bg-white border-2 border-black font-black text-sm outline-none resize-none h-20 rounded-none"
            />
          </div>
        </div>

        <div className="flex-shrink-0 px-4 pb-8 pt-2 bg-white">
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={isPending}
            variant="primary"
            className="w-full h-14 text-base uppercase tracking-widest shadow-[4px_4px_0px_#000]"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </div>
      </div>
    </>
  )
}
