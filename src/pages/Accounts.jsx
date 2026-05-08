import { useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount, useReconcileAccount } from '../hooks/useAccounts';
import { FAB } from './Dashboard';

import AccountList from '../components/accounts/AccountList';
import AccountFormModal from '../components/accounts/AccountFormModal';
import AccountDeleteConfirm from '../components/accounts/AccountDeleteConfirm';
import ReconcileModal from '../components/accounts/ReconcileModal';

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const reconcileAccount = useReconcileAccount();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reconcileTarget, setReconcileTarget] = useState(null);

  const handleOpenForm = (account = null) => {
    setEditTarget(account);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditTarget(null);
  };

  const handleFormSubmit = (payload) => {
    if (editTarget) {
      updateAccount.mutate(payload, { onSuccess: handleCloseForm });
    } else {
      createAccount.mutate(payload, { onSuccess: handleCloseForm });
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteAccount.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const handleReconcile = (payload) => {
    if (reconcileTarget) {
      reconcileAccount.mutate(
        { id: reconcileTarget.id, ...payload },
        { onSuccess: () => setReconcileTarget(null) }
      );
    }
  };

  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
    : 0;

  const formatIDR = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount ?? 0);

  return (
    <div className="px-4 pt-4 pb-24 relative min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 text-left">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Manajemen</p>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <Wallet size={24} strokeWidth={3} />
            Akun Anda
          </h1>
        </div>
      </div>

      {/* Global Summary */}
      {!isLoading && accounts && accounts.length > 0 && (
        <div className="mb-6 bg-blue-50 border-4 border-black p-4 text-left shadow-[4px_4px_0px_0px_#000] rounded-none">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Total Kekayaan</p>
          <p className="text-3xl font-black text-black tracking-tight">{formatIDR(totalBalance)}</p>
        </div>
      )}

      {/* List */}
      <AccountList
        accounts={accounts}
        isLoading={isLoading}
        onAdd={() => handleOpenForm()}
        onEdit={handleOpenForm}
        onDelete={setDeleteTarget}
        onReconcile={setReconcileTarget}
      />

      {/* FAB */}
      <FAB onClick={() => handleOpenForm()} />

      {/* Modals */}
      <AccountFormModal
        isOpen={isFormOpen}
        initialData={editTarget}
        isLoading={createAccount.isPending || updateAccount.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      <AccountDeleteConfirm
        account={deleteTarget}
        isLoading={deleteAccount.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ReconcileModal
        account={reconcileTarget}
        isLoading={reconcileAccount.isPending}
        onReconcile={handleReconcile}
        onClose={() => setReconcileTarget(null)}
      />
    </div>
  );
}
