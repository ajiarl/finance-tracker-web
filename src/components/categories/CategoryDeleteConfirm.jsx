import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function CategoryDeleteConfirm({ category, isLoading, onConfirm, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  
  if (!category) return null;

  const isHapus = confirmText.toUpperCase() === 'HAPUS';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm rounded-none overflow-hidden">
        {/* Header Danger */}
        <div className="bg-red-600 text-white p-4 flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} strokeWidth={3} />
            <h2 className="text-lg font-black uppercase tracking-tight">Hapus Kategori?</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6">
          <div className="p-4 bg-red-50 border-2 border-red-600 rounded-none mb-6 text-left">
            <p className="text-sm font-bold text-red-700 leading-relaxed">
              Anda akan menghapus kategori <span className="font-black underline">"{category.name}"</span>. 
              Semua transaksi yang menggunakan kategori ini akan kehilangan label kategorinya. 
              <br/><br/>
              <span className="uppercase text-xs tracking-widest font-black">Tindakan ini tidak bisa dibatalkan.</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                Ketik "HAPUS" untuk konfirmasi
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="HAPUS"
                className="w-full bg-white border-2 border-black p-3 font-black text-center shadow-[2px_2px_0px_0px_#000] focus:shadow-none transition-all outline-none rounded-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onConfirm}
                disabled={!isHapus || isLoading}
                className={`w-full p-4 font-black uppercase tracking-widest border-2 border-black transition-all rounded-none ${
                  isHapus && !isLoading
                    ? 'bg-red-600 text-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
              
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full p-3 font-black uppercase tracking-widest text-black bg-white border-2 border-black hover:bg-gray-50 rounded-none"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
