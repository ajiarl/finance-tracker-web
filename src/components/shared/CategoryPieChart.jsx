// src/components/shared/CategoryPieChart.jsx
// FIX: Label "Total" dipindah ke header card — tooltip tidak lagi bertabrakan
// dengan elemen di tengah doughnut.

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const NEO_COLORS = [
  '#FAFF00', // kuning neon
  '#f87171', // merah
  '#60a5fa', // biru
  '#4ade80', // hijau
  '#fb923c', // oranye
  '#e879f9', // magenta
  '#a3e635', // lime
  '#38bdf8', // cyan
]

const DUMMY_CATEGORIES = [
  { label: 'Makan & Minum', value: 450000 },
  { label: 'Transportasi',  value: 180000 },
  { label: 'Hiburan',       value: 120000 },
  { label: 'Belanja',       value: 95000  },
  { label: 'Kesehatan',     value: 75000  },
  { label: 'Lainnya',       value: 60000  },
]

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)

const pct = (val, total) => ((val / total) * 100).toFixed(1)

const buildOptions = (total) => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: '55%',
  plugins: {
    legend: { display: false },
    tooltip: {
      // ✅ FIX: 'nearest' membuat tooltip muncul dekat slice yang di-hover,
      // bukan di tengah chart — tidak akan menimpa area kosong tengah lagi.
      position: 'nearest',
      backgroundColor: '#fff',
      borderColor: '#000',
      borderWidth: 2,
      titleColor: '#000',
      bodyColor: '#000',
      titleFont: {
        weight: '800',
        size: 12,
        family: "'Plus Jakarta Sans', sans-serif",
      },
      bodyFont: {
        weight: '600',
        size: 12,
        family: "'Plus Jakarta Sans', sans-serif",
      },
      padding: 10,
      // ✅ FIX: xAlign & yAlign auto agar tooltip keluar ke sisi luar slice
      xAlign: 'center',
      yAlign: 'bottom',
      callbacks: {
        label: (ctx) =>
          ` ${formatIDR(ctx.raw)} (${pct(ctx.raw, total)}%)`,
      },
    },
  },
})

export default function CategoryPieChart({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] text-left rounded-none">
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-black rounded-none">
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest text-white leading-tight">
              Breakdown Pengeluaran
            </h3>
            <p className="text-[11px] font-black text-[#FAFF00] mt-0.5 uppercase tracking-widest">
              Total: {formatIDR(0)}
            </p>
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Bulan ini
          </span>
        </div>
        <div className="p-10 flex items-center justify-center text-center">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
            Belum ada pengeluaran
          </p>
        </div>
      </div>
    )
  }

  const total = categories.reduce((sum, c) => sum + c.value, 0)
  const options = buildOptions(total)

  const data = {
    labels: categories.map((c) => c.label),
    datasets: [
      {
        data:            categories.map((c) => c.value),
        backgroundColor: NEO_COLORS.slice(0, categories.length),
        borderColor:     '#000',
        borderWidth:     3,
        hoverOffset:     8,
      },
    ],
  }

  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] text-left rounded-none">

      {/* ── Header: judul + total (dipindah ke sini dari tengah chart) ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-black rounded-none">
        <div>
          <h3 className="font-black text-sm uppercase tracking-widest text-white leading-tight">
            Breakdown Pengeluaran
          </h3>
          <p className="text-[11px] font-black text-[#FAFF00] mt-0.5 uppercase tracking-widest">
            Total: {formatIDR(total)}
          </p>
        </div>
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
          Bulan ini
        </span>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* ── Doughnut — lubang tengah KOSONG, tidak ada overlay ── */}
        <div className="mx-auto" style={{ width: 240, height: 240 }}>
          <Doughnut data={data} options={options} />
        </div>

        {/* ── Custom Legend ── */}
        <ul className="flex flex-col gap-2">
          {categories.map((cat, i) => (
            <li key={cat.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="flex-shrink-0 w-3 h-3 border-2 border-black rounded-none"
                  style={{ backgroundColor: NEO_COLORS[i] ?? '#ccc' }}
                />
                <span className="text-xs font-black text-black truncate uppercase tracking-tight">
                  {cat.label}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-gray-400 font-black uppercase">
                  {formatIDR(cat.value)}
                </span>
                <span className="text-xs font-black text-black w-10 text-right">
                  {pct(cat.value, total)}%
                </span>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}
