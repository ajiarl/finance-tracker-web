// src/components/ui/Button.jsx
// Tombol Neobrutalism dengan efek "ditekan": hover/active menggeser posisi dan mengecilkan shadow.
// Mendukung loading state (spinner) dan tiga varian warna utama.

const variants = {
  primary:   'bg-[#FAFF00] text-black hover:bg-[#e8ed00]',  // kuning neon
  secondary: 'bg-white text-black hover:bg-gray-50',
  danger:    'bg-red-500 text-white hover:bg-red-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  className = '',
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-bold tracking-wide border-2 border-black',
        'shadow-[4px_4px_0px_0px_#000]',
        'transition-all duration-100',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : [
              'cursor-pointer',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
              'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
            ].join(' '),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
