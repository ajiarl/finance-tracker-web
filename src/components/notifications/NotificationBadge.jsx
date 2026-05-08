import React from 'react';

export default function NotificationBadge({ count }) {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-black text-white text-[9px] font-black uppercase leading-none z-10 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none">
      {displayCount}
    </div>
  );
}
