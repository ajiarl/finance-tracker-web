import React from 'react';
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationList, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import NotificationList from '../components/notifications/NotificationList';

export default function Notifications() {
  const { data, isLoading } = useNotificationList();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unread_count || 0;

  return (
    <div className="px-4 pt-4 pb-24 relative min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 text-left">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={32} strokeWidth={3} className="text-black" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-black flex items-center justify-center text-[10px] font-black text-white shadow-[1px_1px_0px_0px_#000]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Pusat Pesan</p>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">Notifikasi</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              title="Tandai semua dibaca"
              className="flex items-center justify-center w-10 h-10 bg-[#FAFF00] border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <CheckCheck size={20} strokeWidth={3} />
            </button>
          )}
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center w-10 h-10 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <ArrowLeft size={20} strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* List */}
      <NotificationList 
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={(id) => markAsRead.mutate(id)}
      />

      {/* Footer Info */}
      {notifications.length > 0 && (
        <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
          Menampilkan {notifications.length} notifikasi terbaru
        </p>
      )}
    </div>
  );
}
