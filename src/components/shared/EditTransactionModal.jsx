// src/components/shared/EditTransactionModal.jsx
// Modal edit transaksi. Prefill form dari data transaksi yang dipilih.
// Pola persis sama dengan FastAddModal: bottom sheet, RHF + Zod, useMutation.

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { updateTransaction, getCategories, getAccounts } from '../../api/transactions'
import Input from '../ui/Input'
import Button from '../ui/Button'

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Jumlah wajib diisi' })
    .positive('Jumlah harus lebih dari 0'),
  type: z.enum(['expense', 'income', 'transfer']),
  category_id: z.string().optional(),
  account_id: z.string().min(1, 'Pilih akun'),
  transaction_date: z.string().min(1, 'Tanggal wajib diisi'),
  description: z.string().max(255).optional(),
  notes: z.string().optional(),
  tags: z.string().optional(), // input sebagai string CSV, parse saat submit
})

export default function EditTransactionModal({ transaction, onClose }) {
  const queryClient = useQueryClient()

  // Fetch data untuk dropdown — gunakan cache yang sudah ada dari FastAddModal
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })
  const { data: accountsData = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    staleTime: 5 * 60 * 1000,
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : []
  const accounts = Array.isArray(accountsData) ? accountsData : []

  const {
    register,
    handleSubmit,
    control,
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
      transaction_date: '',
      description: '',
      notes: '',
      tags: '',
    },
  })

  const currentType = watch('type')

  // Prefill form saat transaction berubah
  useEffect(() => {
    if (!transaction) return
    reset({
      amount: parseFloat(transaction.amount),
      type: transaction.type,
      category_id: transaction.category_id ? String(transaction.category_id) : '',
      account_id: String(transaction.account_id),
      transaction_date: transaction.transaction_date ?? '',
      description: transaction.description ?? '',
      notes: transaction.notes ?? '',
      tags: Array.isArray(transaction.tags) ? transaction.tags.join(', ') : '',
    })
  }, [transaction, reset])

  // Tutup dengan Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data) => updateTransaction(transaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      onClose()
    },
  })

  const onSubmit = (data) => {
    // Parse tags dari string CSV menjadi array
    const tagsArray = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    mutate({
      amount: data.amount,
      type: data.type,
      category_id: data.category_id ? Number(data.category_id) : null,
      account_id: Number(data.account_id),
      transaction_date: data.transaction_date,
      description: data.description || null,
      notes: data.notes || null,
      tags: tagsArray,
    })
  }

  if (!transaction) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit transaksi"
        className="
          fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:bottom-auto md:w-[90%] md:max-w-md z-[60]
          bg-white border-t-4 md:border-4 border-black
          shadow-[0_-8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[8px_8px_0px_0px_#000]
          flex flex-col max-h-[90vh] md:max-h-[calc(100vh-4rem)]
          animate-in slide-in-from-bottom md:zoom-in duration-300
        "
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black">
          <h2 className="text-white font-black text-base uppercase tracking-widest text-left">
            Edit Transaksi
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup modal edit"
            className="
              flex items-center justify-center w-8 h-8
              border-2 border-white text-white rounded-none
              hover:bg-white hover:text-black transition-colors duration-100
            "
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-5 text-left">

          {isError && (
            <div className="px-3 py-2.5 bg-red-50 border-2 border-red-500 text-red-600 text-sm font-black rounded-none">
              {error?.response?.data?.message ??
               error?.response?.data?.error ??
               'Gagal memperbarui. Coba lagi.'}
            </div>
          )}

          {/* Toggle Tipe */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="flex border-2 border-black shadow-[4px_4px_0px_#000] rounded-none overflow-hidden">
                {[
                  { val: 'expense',  label: 'Keluar', activeClass: 'bg-red-500 text-white' },
                  { val: 'income',   label: 'Masuk',   activeClass: 'bg-green-500 text-white' },
                  { val: 'transfer', label: 'Trf',    activeClass: 'bg-blue-500 text-white' },
                ].map(({ val, label, activeClass }, idx, arr) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => field.onChange(val)}
                    className={[
                      'flex-1 py-2.5 font-black text-[11px] uppercase tracking-widest transition-colors duration-100 rounded-none',
                      field.value === val
                        ? activeClass
                        : 'bg-white text-gray-400 hover:text-gray-600',
                      idx < arr.length - 1 ? 'border-r-2 border-black' : '',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          />

          {/* Jumlah */}
          <div>
            <label
              htmlFor="edit-amount"
              className="block text-sm font-black uppercase tracking-wider text-black mb-1"
            >
              Jumlah (IDR)
            </label>
            <input
              id="edit-amount"
              type="number"
              inputMode="numeric"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
              className={[
                'w-full px-3 py-2.5 bg-white text-black font-black text-lg rounded-none',
                'border-2 border-black outline-none',
                'focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-100',
                errors.amount ? 'border-red-500 bg-red-50' : '',
              ].join(' ')}
            />
            {errors.amount && (
              <p className="mt-1 text-xs font-black text-red-500">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-black uppercase tracking-wider text-black mb-1"
            >
              Deskripsi{' '}
              <span className="font-normal text-gray-400 normal-case">(opsional)</span>
            </label>
            <input
              id="edit-description"
              type="text"
              placeholder="Makan siang, bensin, dll"
              {...register('description')}
              className="
                w-full px-3 py-2.5 bg-white text-black font-black text-sm rounded-none
                border-2 border-black outline-none uppercase tracking-wider
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-100
              "
            />
          </div>

          {/* Kategori */}
          <div>
            <label
              htmlFor="edit-category"
              className="block text-sm font-black uppercase tracking-wider text-black mb-1"
            >
              Kategori
            </label>
            <select
              id="edit-category"
              {...register('category_id')}
              className="
                w-full px-3 py-2.5 bg-white text-black font-black text-sm uppercase tracking-wider rounded-none
                border-2 border-black outline-none appearance-none cursor-pointer
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-100
              "
            >
              <option value="">-- Tanpa Kategori --</option>
              {categories
                .filter((c) => !c.type || c.type === currentType)
                .map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Akun */}
          <div>
            <label
              htmlFor="edit-account"
              className="block text-sm font-black uppercase tracking-wider text-black mb-1"
            >
              Akun
            </label>
            <select
              id="edit-account"
              {...register('account_id')}
              className={[
                'w-full px-3 py-2.5 bg-white text-black font-black text-sm uppercase tracking-wider rounded-none',
                'border-2 border-black outline-none appearance-none cursor-pointer',
                'focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-100',
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
              <p className="mt-1 text-xs font-black text-red-500">
                {errors.account_id.message}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <Input
            id="edit-date"
            label="Tanggal"
            type="date"
            error={errors.transaction_date}
            registration={register('transaction_date')}
          />

          {/* Tags */}
          <div>
            <label
              htmlFor="edit-tags"
              className="block text-sm font-black uppercase tracking-wider text-black mb-1"
            >
              Tags{' '}
              <span className="font-normal text-gray-400 normal-case">
                (pisahkan dengan koma)
              </span>
            </label>
            <input
              id="edit-tags"
              type="text"
              placeholder="makan, kantin, teman"
              {...register('tags')}
              className="
                w-full px-3 py-2.5 bg-white text-black font-black text-sm rounded-none
                border-2 border-black outline-none
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-100
              "
            />
          </div>

          {/* Catatan */}
          <div>
            <label
              htmlFor="edit-notes"
              className="block text-sm font-black uppercase tracking-wider text-black mb-1"
            >
              Catatan{' '}
              <span className="font-normal text-gray-400 normal-case">(opsional)</span>
            </label>
            <textarea
              id="edit-notes"
              rows={2}
              placeholder="Catatan tambahan..."
              {...register('notes')}
              className="
                w-full px-3 py-2.5 bg-white text-black font-black text-sm rounded-none
                border-2 border-black outline-none resize-none
                focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-100
              "
            />
          </div>

          {/* Submit */}
          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
            className="w-full uppercase tracking-widest h-14"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </>
  )
}
