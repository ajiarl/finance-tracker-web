import React from 'react';
import CategoryCard from './CategoryCard';
import CategoryEmptyState from './CategoryEmptyState';

export default function CategoryList({ categories, isLoading, activeTab, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse border-2 border-black rounded-none" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <CategoryEmptyState activeTab={activeTab} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
