import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, 
  format, isSameDay 
} from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, Calendar } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { cn } from '../lib/utils';
import AiInsightsPanel from '../components/reports/AiInsightsPanel';

const DATE_PRESETS = [
  { id: 'this_month', label: 'Bulan Ini' },
  { id: 'last_month', label: 'Bulan Lalu' },
  { id: 'last_3_months', label: '3 Bulan' },
  { id: 'this_year', label: 'Tahun Ini' },
];

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [activePreset, setActivePreset] = useState('this_month');
  
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (activePreset) {
      case 'last_month': {
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case 'last_3_months': {
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      }
      case 'this_year': {
        return { start: startOfYear(now), end: endOfYear(now) };
      }
      case 'this_month':
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [activePreset]);

  const { data, isLoading } = useAnalytics({
    start_date: format(dateRange.start, 'yyyy-MM-dd'),
    end_date: format(dateRange.end, 'yyyy-MM-dd')
  });

  const formatIDR = (val) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_#000] rounded-none">
          <p className="font-black text-xs uppercase mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-bold text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatIDR(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Analisis Keuangan</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">
            Laporan & Statistik Transaksi
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset.id)}
              className={cn(
                "px-4 py-2 font-black text-sm uppercase tracking-wider border-2 border-black transition-all",
                activePreset === preset.id 
                  ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]" 
                  : "bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Pemasukan" 
          value={data?.summary?.total_income} 
          icon={<TrendingUp className="text-green-600" />} 
          className="bg-green-50"
        />
        <SummaryCard 
          title="Pengeluaran" 
          value={data?.summary?.total_expense} 
          icon={<TrendingDown className="text-red-600" />} 
          className="bg-red-50"
        />
        <SummaryCard 
          title="Saldo Bersih" 
          value={data?.summary?.net} 
          icon={<Wallet className="text-blue-600" />} 
          className="bg-blue-50"
        />
        <SummaryCard 
          title="Savings Rate" 
          value={data?.summary?.savings_rate} 
          isPercent
          icon={<PieIcon className="text-amber-600" />} 
          className="bg-amber-50"
        />
      </div>

      {/* AI Insights — Pak Hemat */}
      <AiInsightsPanel
        startDate={format(dateRange.start, 'yyyy-MM-dd')}
        endDate={format(dateRange.end, 'yyyy-MM-dd')}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Time Series Bar Chart */}
        <div className="lg:col-span-2 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000]">
          <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Calendar size={20} /> Tren Harian
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.time_series} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} vertical={false} />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontWeight: 700, fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000', strokeWidth: 2 }}
                  tickLine={{ stroke: '#000' }}
                  tickFormatter={(str) => format(new Date(str), 'dd MMM')}
                />
                <YAxis 
                  tick={{ fontWeight: 700, fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000', strokeWidth: 2 }}
                  tickLine={{ stroke: '#000' }}
                  tickFormatter={(val) => val > 1000000 ? `${(val/1000000).toFixed(1)}M` : val > 1000 ? `${val/1000}K` : val}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#000', opacity: 0.05 }} />
                <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }} />
                <Bar name="Masuk" dataKey="income" fill="#22c55e" stroke="#000" strokeWidth={2} radius={0} />
                <Bar name="Keluar" dataKey="expense" fill="#ef4444" stroke="#000" strokeWidth={2} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart breakdown */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000]">
          <h3 className="text-xl font-black uppercase mb-6">Pengeluaran / Kategori</h3>
          <div className="h-[350px] w-full">
            {(() => {
              const pieData = data?.expense_by_category?.map(item => ({ ...item, amount: Number(item.amount) })) || [];
              return (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={0}
                      dataKey="amount"
                      nameKey="name"
                      stroke="#000"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ border: '2px solid #000', borderRadius: 0, boxShadow: '3px 3px 0px #000', fontWeight: 'bold' }}
                      itemStyle={{ color: '#000' }}
                    />
                    <Legend iconType="square" wrapperStyle={{ fontWeight: 'bold' }}/>
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, className, isPercent }) {
  const formatIDR = (val) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className={cn("border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between", className)}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</span>
        <div className="p-1 border-2 border-black bg-white">{icon}</div>
      </div>
      <div className="mt-4">
        <span className="text-xl font-black">
          {isPercent ? `${value || 0}%` : formatIDR(value)}
        </span>
      </div>
    </div>
  );
}
