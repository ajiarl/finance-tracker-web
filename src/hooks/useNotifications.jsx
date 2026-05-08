import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import * as notifApi from '../api/notifications';

export const notificationKeys = {
  all: ['notifications'],
  count: () => ['notifications', 'count'],
  list: () => ['notifications', 'list'],
};

export function useNotifications(enabled = true) {
  const qc = useQueryClient();
  const prevCountRef = useRef(null);

  // 1. The Heartbeat (Unread Count)
  const countQuery = useQuery({
    queryKey: notificationKeys.count(),
    queryFn: notifApi.fetchUnreadCount,
    refetchInterval: (query) => {
      if (document.hidden) return false;
      return query.state.data?.unread_count > 0 ? 30000 : 60000;
    },
    refetchIntervalInBackground: false,
    staleTime: 25000,
    enabled,
  });

  // Detection: Show toast when new notifications arrive
  useEffect(() => {
    const currentCount = countQuery.data?.unread_count ?? 0;
    const prevCount = prevCountRef.current;

    if (prevCount !== null && currentCount > prevCount) {
      const delta = currentCount - prevCount;
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-in slide-in-from-top-full' : 'animate-out fade-out-0 slide-out-to-top-full'
          } max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 flex items-center justify-between gap-4 rounded-none pointer-events-auto`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FAFF00] border-2 border-black flex items-center justify-center rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-lg">🔔</span>
            </div>
            <p className="text-xs font-black uppercase tracking-tight text-black">
              {delta} Notifikasi Baru Tersedia
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 w-8 h-8 border-2 border-black bg-white flex items-center justify-center font-black hover:bg-black hover:text-white transition-colors rounded-none"
          >
            ✕
          </button>
        </div>
      ), { duration: 5000 });
      // Sync list if user is on notification page
      qc.invalidateQueries({ queryKey: notificationKeys.list() });
    }

    prevCountRef.current = currentCount;
  }, [countQuery.data?.unread_count, qc]);

  return {
    unreadCount: countQuery.data?.unread_count ?? 0,
    isCountLoading: countQuery.isLoading,
  };
}

export function useNotificationList() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: notifApi.fetchNotifications,
    staleTime: 60000,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: notifApi.markAsRead,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });

      const prevCount = qc.getQueryData(notificationKeys.count());
      const prevList = qc.getQueryData(notificationKeys.list());

      // Optimistic update
      qc.setQueryData(notificationKeys.count(), (old) => ({
        unread_count: Math.max(0, (old?.unread_count ?? 1) - 1)
      }));

      qc.setQueryData(notificationKeys.list(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(n => n.id === id ? { ...n, is_read: true } : n)
        };
      });

      return { prevCount, prevList };
    },
    onError: (err, id, context) => {
      qc.setQueryData(notificationKeys.count(), context.prevCount);
      qc.setQueryData(notificationKeys.list(), context.prevList);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: notifApi.markAllAsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });

      const prevCount = qc.getQueryData(notificationKeys.count());
      const prevList = qc.getQueryData(notificationKeys.list());

      // Optimistic update
      qc.setQueryData(notificationKeys.count(), { unread_count: 0 });
      qc.setQueryData(notificationKeys.list(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(n => ({ ...n, is_read: true }))
        };
      });

      return { prevCount, prevList };
    },
    onError: (err, variables, context) => {
      qc.setQueryData(notificationKeys.count(), context.prevCount);
      qc.setQueryData(notificationKeys.list(), context.prevList);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
