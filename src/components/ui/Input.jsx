// src/components/ui/Input.jsx
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  registration = {},
  className = '',
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-bold uppercase tracking-wider text-black"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          {...registration}
          className={[
            'w-full px-3 py-2.5 bg-white text-black font-medium',
            'border-2 border-black outline-none',
            'placeholder:text-gray-400',
            'focus:shadow-[3px_3px_0px_0px_#000]',
            'transition-shadow duration-100',
            isPassword ? 'pr-10' : '',
            error
              ? 'border-red-500 bg-red-50 focus:shadow-[3px_3px_0px_0px_rgb(239,68,68)]'
              : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword
              ? <EyeOff size={18} strokeWidth={2} />
              : <Eye size={18} strokeWidth={2} />
            }
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 mt-0.5">
          {error.message}
        </p>
      )}
    </div>
  )
}
