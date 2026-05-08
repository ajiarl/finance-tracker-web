import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

import { login } from '../../api/auth'
import { useAuth } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

// ── Skema Validasi ───────────────────────────────────────────────────────────
const schema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter'),
})

// ── Komponen ─────────────────────────────────────────────────────────────────
export default function Login() {
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
      const res = await login(data)
      dispatch({
        type: 'LOGIN',
        token: res.data.token,
        user: res.data.data,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.errors?.email?.[0] ??
        'Login gagal. Periksa kembali email dan password.'
      setServerError(msg)
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
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-none">

        {/* Card Header */}
        <div className="bg-black px-6 py-4 rounded-none">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-black text-xl tracking-tight uppercase">
              Finance Tracker
            </h1>
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5 text-left">
            Catat. Pantau. Kendali keuanganmu.
          </p>
        </div>

        {/* Card Body */}
        <div className="px-6 py-6 text-left">
          <h2 className="text-black font-black text-2xl uppercase mb-1">
            Masuk
          </h2>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-6">
            Selamat datang kembali
          </p>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border-2 border-red-500 text-red-600 text-xs font-black uppercase tracking-tight rounded-none">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
              placeholder="••••••••"
              error={errors.password}
              registration={register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full mt-2 uppercase tracking-widest h-14"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk →'}
            </Button>
          </form>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 border-t-4 border-black bg-gray-50 text-center rounded-none">
          <p className="text-sm text-black font-black uppercase tracking-tight">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-black text-black underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom decorative label */}
      <p className="fixed bottom-4 right-4 text-[10px] font-black text-black/40 uppercase tracking-widest">
        Finance Tracker v1.0
      </p>
    </div>
  )
}
