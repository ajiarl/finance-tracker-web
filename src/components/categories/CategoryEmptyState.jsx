import React from 'react';
import { Tag } from 'lucide-react';

export default function CategoryEmptyState({ activeTab = 'all' }) {
  const messages = {
    all: 'Belum ada kategori yang ditambahkan.',
    income: 'Belum ada kategori pemasukan.',
    expense: 'Belum ada kategori pengeluaran.'
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 border-4 border-dashed border-gray-300 rounded-none bg-gray-50">
      <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#ccc] mb-4">
        <Tag size={32} className="text-gray-400" />
      </div>
      <p className="text-sm font-black uppercase tracking-widest text-gray-500 text-center">
        {messages[activeTab]}
      </p>
    </div>
  );
}
