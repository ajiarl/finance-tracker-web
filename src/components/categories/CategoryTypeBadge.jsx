import React from 'react';

export default function CategoryTypeBadge({ type, isSystem = false }) {
  if (isSystem) {
    return (
      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-blue-400 text-black border-2 border-black rounded-none">
        Sistem
      </span>
    );
  }

  const isIncome = type === 'income';
  
  return (
    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-black rounded-none ${
      isIncome ? 'bg-green-400 text-black' : 'bg-red-400 text-black'
    }`}>
      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
    </span>
  );
}
