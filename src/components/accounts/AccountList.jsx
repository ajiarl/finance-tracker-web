import AccountCard from './AccountCard';
import AccountEmptyState from './AccountEmptyState';

export default function AccountList({ accounts, isLoading, onAdd, onEdit, onDelete, onReconcile }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse border-4 border-black rounded-none shadow-[4px_4px_0px_0px_#000]" />
        ))}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return <AccountEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
          onReconcile={onReconcile}
        />
      ))}
    </div>
  );
}
