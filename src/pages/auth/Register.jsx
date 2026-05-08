// src/pages/auth/Register.jsx
// Halaman registrasi senada dengan Login: card Neobrutalism di atas background kuning + polka dot.
// Validasi password match menggunakan .refine() Zod; sukses register langsung dispatch LOGIN dan redirect.

import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

import { register as registerApi } from '../../api/auth'
import { useAuth } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

// ── Skema Validasi ───────────────────────────────────────────────────────────
const schema = z
  .object({
    name: z
      .string()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama terlalu panjang'),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter'),
    password_confirmation: z
      .string()
      .min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  })

// ── Komponen ─────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()
  const { dispatch } = useAuth()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setServerError(null)
    try {
      const res = await registerApi(data)
      dispatch({
        type: 'LOGIN',
        token: res.data.token,
        user: res.data.data,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Laravel validation errors (422) bisa berisi objek errors per field
      const laravelErrors = err.response?.data?.errors
      if (laravelErrors) {
        const firstError = Object.values(laravelErrors).flat()[0]
        setServerError(firstError)
      } else {
        setServerError(
          err.response?.data?.message ?? 'Pendaftaran gagal. Coba lagi.'
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFF00] flex items-center justify-center p-4 font-sans">

      {/* Decorative background dots */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">

        {/* Card Header */}
        <div className="bg-black px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-black text-xl tracking-tight uppercase">
              Finance Tracker
            </h1>
          </div>
          <p className="text-gray-400 text-xs mt-0.5 text-left">
            Catat. Pantau. Kendali keuanganmu.
          </p>
        </div>

        {/* Card Body */}
        <div className="px-6 py-6 text-left">
          <h2 className="text-black font-black text-2xl uppercase mb-1">
            Daftar
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Buat akun baru dan mulai catat keuanganmu
          </p>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border-2 border-red-500 text-red-600 text-sm font-semibold">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              id="name"
              label="Nama Lengkap"
              type="text"
              placeholder="Budi Santoso"
              error={errors.name}
              registration={register('name')}
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="kamu@email.com"
              error={errors.email}
              registration={register('email')}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              error={errors.password}
              registration={register('password')}
            />

            <Input
              id="password_confirmation"
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              error={errors.password_confirmation}
              registration={register('password_confirmation')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full mt-2 uppercase tracking-widest"
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Buat Akun →'}
            </Button>
          </form>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 border-t-2 border-black bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link
              to="/login"
              className="font-black text-black underline decoration-2 underline-offset-2 hover:text-[#333] transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom decorative label */}
      <p className="fixed bottom-4 right-4 text-[10px] font-bold text-black/40 uppercase tracking-widest">
        Finance Tracker v1.0
      </p>
    </div>
  )
}
