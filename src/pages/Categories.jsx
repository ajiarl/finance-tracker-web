import React, { useState, useMemo } from 'react';
import { Tag, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  isSystemCategory 
} from '../hooks/useCategories';

import CategoryList from '../components/categories/CategoryList';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import CategoryDeleteConfirm from '../components/categories/CategoryDeleteConfirm';
import { FAB } from './Dashboard';

export default function Categories() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'income' | 'expense'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: allCategories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Client-side filtering for tabs
  const filteredCategories = useMemo(() => {
    if (activeTab === 'all') return allCategories;
    return allCategories.filter(c => c.type === activeTab);
  }, [allCategories, activeTab]);

  const handleOpenForm = (category = null) => {
    if (category && isSystemCategory(category)) {
      toast.error('Kategori sistem tidak dapat diubah.');
      return;
    }
    setEditTarget(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
  };

  const handleFormSubmit = (payload) => {
    if (editTarget) {
      updateCategory.mutate(
        { id: editTarget.id, ...payload },
        { 
          onSuccess: () => {
            toast.success('Kategori berhasil diperbarui');
            handleCloseForm();
          },
          onError: (error) => {
            if (error?.response?.status === 403) {
              toast.error('Kategori sistem tidak dapat diubah.');
            } else {
              toast.error('Gagal memperbarui kategori.');
            }
          }
        }
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast.success('Kategori berhasil dibuat');
          handleCloseForm();
        },
        onError: () => {
          toast.error('Gagal membuat kategori.');
        }
      });
    }
  };

  const handleDeleteRequest = (category) => {
    if (isSystemCategory(category)) {
      toast.error('Kategori sistem tidak dapat dihapus.');
      return;
    }
    setDeleteTarget(category);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    
    deleteCategory.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Kategori berhasil dihapus');
        setDeleteTarget(null);
      },
      onError: (error) => {
        setDeleteTarget(null);
        if (error?.response?.status === 403) {
          toast.error('Kategori sistem tidak dapat dihapus.');
        } else if (error?.response?.status === 422) {
          toast.error('Kategori masih digunakan oleh transaksi.');
        } else {
          toast.error('Gagal menghapus kategori.');
        }
      }
    });
  };

  return (
    <div className="px-4 pt-4 pb-24 relative min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 text-left">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Pengaturan</p>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <Tag size={24} strokeWidth={3} />
            Kategori
          </h1>
        </div>
        <Link 
          to="/settings" 
          className="flex items-center justify-center w-10 h-10 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'income', label: 'Pemasukan' },
          { id: 'expense', label: 'Pengeluaran' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-black transition-all rounded-none whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-[#FAFF00] shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Area */}
      <CategoryList
        categories={filteredCategories}
        isLoading={isLoading}
        activeTab={activeTab}
        onEdit={handleOpenForm}
        onDelete={handleDeleteRequest}
      />

      {/* FAB */}
      <FAB onClick={() => handleOpenForm()} />

      {/* Modals */}
      <CategoryFormModal
        isOpen={isFormOpen}
        initialData={editTarget}
        isLoading={createCategory.isPending || updateCategory.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      <CategoryDeleteConfirm
        category={deleteTarget}
        isLoading={deleteCategory.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
