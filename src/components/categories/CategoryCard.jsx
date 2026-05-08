import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Edit2, Trash2, Lock } from 'lucide-react';
import { isSystemCategory } from '../../hooks/useCategories';
import CategoryTypeBadge from './CategoryTypeBadge';

export default function CategoryCard({ category, onEdit, onDelete }) {
  const isSystem = isSystemCategory(category);
  
  // Dynamic icon from lucide-react
  const IconComponent = LucideIcons[category.icon] || LucideIcons.HelpCircle;

  return (
    <div className={`flex items-center justify-between p-4 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white ${
      isSystem ? 'border-gray-400 opacity-90' : 'border-black'
    }`}>
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-none shadow-[2px_2px_0px_0px_#000]"
          style={{ backgroundColor: category.color || '#E5E7EB' }}
        >
          <IconComponent size={24} strokeWidth={3} className="text-black" />
        </div>
        
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-black uppercase tracking-tight leading-tight">
              {category.name}
            </h3>
            <CategoryTypeBadge type={category.type} isSystem={isSystem} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            ID: {category.id} • {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => !isSystem && onEdit(category)}
          disabled={isSystem}
          title={isSystem ? 'Kategori sistem tidak dapat diubah' : 'Ubah kategori'}
          className={`flex items-center justify-center w-9 h-9 border-2 border-black rounded-none transition-all ${
            isSystem 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-[#FAFF00] text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
          }`}
        >
          {isSystem ? <Lock size={16} strokeWidth={3} /> : <Edit2 size={16} strokeWidth={3} />}
        </button>

        <button
          onClick={() => !isSystem && onDelete(category)}
          disabled={isSystem}
          title={isSystem ? 'Kategori sistem tidak dapat dihapus' : 'Hapus kategori'}
          className={`flex items-center justify-center w-9 h-9 border-2 border-black rounded-none transition-all ${
            isSystem 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-red-500 text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
          }`}
        >
          <Trash2 size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
