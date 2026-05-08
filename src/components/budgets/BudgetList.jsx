// src/components/budgets/BudgetList.jsx
import BudgetCard from './BudgetCard';
import BudgetEmptyState from './BudgetEmptyState';

export default function BudgetList({ budgets, isLoading, onEdit, onDelete, onAdd }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] animate-pulse rounded-none">
            <div className="h-6 bg-gray-200 w-1/2 mb-2 rounded-none"></div>
            <div className="h-3 bg-gray-200 w-1/4 mb-4 rounded-none"></div>
            <div className="h-4 bg-gray-200 w-full mb-1 rounded-none"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return <BudgetEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
