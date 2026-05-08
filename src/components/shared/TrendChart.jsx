// src/components/shared/TrendChart.jsx
// Bar chart 7 hari: Pemasukan (hijau) vs Pengeluaran (merah) dengan estetika
// Neobrutalism — border hitam tebal pada bar, grid garis solid, font bold.

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// ── Dummy Data (ganti dengan data real dari API) ─────────────────────────────
const DUMMY_LABELS = ['Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min', 'Sen']

const DUMMY_INCOME  = [320000, 0,      150000, 500000, 80000,  0,      250000]
const DUMMY_EXPENSE = [120000, 95000,  210000, 75000,  300000, 180000, 140000]

// ── Chart Options ────────────────────────────────────────────────────────────
const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'start',
      labels: {
        font: { size: 11, weight: '800', family: "'Plus Jakarta Sans', sans-serif" },
        color: '#000',
        boxWidth: 14,
        boxHeight: 14,
        padding: 16,
        // Kotak legend berbentuk persegi solid (Neobrutalism)
        usePointStyle: false,
      },
    },
    tooltip: {
      backgroundColor: '#fff',
      borderColor: '#000',
      borderWidth: 2,
      titleColor: '#000',
      bodyColor: '#000',
      titleFont: { weight: '800', size: 12, family: "'Plus Jakarta Sans', sans-serif" },
      bodyFont:  { weight: '600', size: 12, family: "'Plus Jakarta Sans', sans-serif" },
      padding: 10,
      callbacks: {
        label: (ctx) => {
          const val = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(ctx.raw)
          return ` ${ctx.dataset.label}: ${val}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },                      // Hapus grid vertikal — lebih bersih
      border: { color: '#000', width: 2 },
      ticks: {
        font: { size: 11, weight: '700', family: "'Plus Jakarta Sans', sans-serif" },
        color: '#000',
      },
    },
    y: {
      grid: {
        color: '#e5e5e5',                            // Grid horizontal abu tipis
        lineWidth: 1,
      },
      border: { color: '#000', width: 2, dash: [] },
      ticks: {
        font: { size: 10, weight: '700', family: "'Plus Jakarta Sans', sans-serif" },
        color: '#555',
        callback: (val) => {
          if (val >= 1_000_000) return `${val / 1_000_000}jt`
          if (val >= 1_000)    return `${val / 1_000}rb`
          return val
        },
      },
    },
  },
}

// ── Dataset ──────────────────────────────────────────────────────────────────
const buildData = (income, expense, labels) => ({
  labels,
  datasets: [
    {
      label: 'Pemasukan',
      data: income,
      backgroundColor: '#4ade80',   // hijau solid
      borderColor: '#000',
      borderWidth: 2,
      borderRadius: 0,              // Sudut tajam — khas Neobrutalism
      borderSkipped: false,
    },
    {
      label: 'Pengeluaran',
      data: expense,
      backgroundColor: '#f87171',   // merah solid
      borderColor: '#000',
      borderWidth: 2,
      borderRadius: 0,
      borderSkipped: false,
    },
  ],
})

// ── Komponen ─────────────────────────────────────────────────────────────────
export default function TrendChart({ labels, income, expense }) {
  if (!labels || labels.length === 0 || !income || !expense) {
    return (
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] text-left rounded-none">
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#FAFF00] rounded-none">
          <h3 className="font-black text-sm uppercase tracking-widest text-black">
            Tren 7 Hari Terakhir
          </h3>
          <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">
            Pemasukan vs Pengeluaran
          </span>
        </div>
        <div className="p-10 flex items-center justify-center text-center">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
            Belum ada transaksi
          </p>
        </div>
      </div>
    )
  }

  const data = buildData(income, expense, labels)

  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] text-left rounded-none">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#FAFF00] rounded-none">
        <h3 className="font-black text-sm uppercase tracking-widest text-black">
          Tren 7 Hari Terakhir
        </h3>
        <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">
          Pemasukan vs Pengeluaran
        </span>
      </div>

      {/* Chart Area */}
      <div className="p-4" style={{ height: 220 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
