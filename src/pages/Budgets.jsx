// src/pages/Budgets.jsx
import { useState } from 'react';
import { FAB } from './Dashboard';
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget
} from '../hooks/useBudgets';

import BudgetList from '../components/budgets/BudgetList';
import BudgetFormModal from '../components/budgets/BudgetFormModal';
import BudgetDeleteConfirm from '../components/budgets/BudgetDeleteConfirm';

export default function Budgets() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  
  // Queries & Mutations
  const { data: budgets = [], isLoading } = useBudgets({ period });
  
  const { mutate: createBudget, isPending: isCreating, error: createError } = useCreateBudget();
  const { mutate: updateBudget, isPending: isUpdating, error: updateError } = useUpdateBudget();
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();

  // Handlers
  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const handleFormSubmit = (payload) => {
    if (editingBudget) {
      updateBudget(payload, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createBudget(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleDeleteConfirm = (id) => {
    deleteBudget(id, {
      onSuccess: () => setDeleteTargetId(null),
    });
  };

  // Determine error from mutation to pass down
  const serverError = createError?.response?.data?.message || updateError?.response?.data?.message || null;

  return (
    <div className="px-4 pt-4 pb-24 space-y-4 relative min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="text-left mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          Kontrol
        </p>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
          Anggaran
        </h1>
        
        {/* Period Filter */}
        <div className="flex flex-col text-left">
          <label className="block text-[10px] font-black uppercase tracking-wider text-black mb-1">
            Filter Periode
          </label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white text-black font-black border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000] focus:shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none outline-none transition-all"
          />
        </div>
      </div>

      {/* Main List */}
      <BudgetList
        budgets={budgets}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTargetId}
        onAdd={handleOpenCreate}
      />

      {/* FAB to trigger creation */}
      {budgets.length > 0 && <FAB onClick={handleOpenCreate} />}

      {/* Modals */}
      <BudgetFormModal
        isOpen={isFormOpen}
        initialData={editingBudget}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isPending={isCreating || isUpdating}
        serverError={serverError}
      />

      <BudgetDeleteConfirm
        isOpen={!!deleteTargetId}
        budgetId={deleteTargetId}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
