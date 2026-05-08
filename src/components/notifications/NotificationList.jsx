import React from 'react';
import NotificationCard from './NotificationCard';
import { BellOff } from 'lucide-react';

export default function NotificationList({ notifications, isLoading, onMarkAsRead }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]" />
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 border-4 border-dashed border-gray-300 rounded-none bg-gray-50">
        <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#ccc] mb-4">
          <BellOff size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter text-gray-300">Inbox Bersih</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
          Tidak ada notifikasi baru untuk Anda
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notifications.map(notification => (
        <NotificationCard 
          key={notification.id} 
          notification={notification} 
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
