import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as notifApi from '../api/notifications';

export const notificationKeys = {
  all: ['notifications'],
  count: () => ['notifications', 'count'],
  list: () => ['notifications', 'list'],
};

const ALERT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export function useNotifications(enabled = true) {
  const qc = useQueryClient();
  const navigate = useNavigate();
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

  // TEST TOAST ON MOUNT
  useEffect(() => {
    toast.success('Sistem Notifikasi Aktif', {
      duration: 3000,
      style: {
        borderRadius: '0',
        border: '2px solid black',
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: '10px',
      },
    });
  }, []);

  // Detection: Show toast when new notifications arrive
  useEffect(() => {
    const currentCount = countQuery.data?.unread_count ?? 0;
    const prevCount = prevCountRef.current;

    // Trigger logic if count increases OR if it's the first load and we have unread items
    const isNew = prevCount !== null && currentCount > prevCount;
    const isFirstLoadWithUnread = prevCount === null && currentCount > 0;

    if (isNew || isFirstLoadWithUnread) {
      // Fetch latest to determine type
      notifApi.fetchNotifications().then((res) => {
        const latest = res.data?.[0];
        if (!latest || (isFirstLoadWithUnread && latest.is_read)) return;

        const isBudgetAlert = latest.type === 'budget_alert';
        const isCritical = isBudgetAlert && (latest.data?.severity === 'critical' || (latest.data?.percentage_used ?? 0) >= 100);
        const isWarning = isBudgetAlert && (latest.data?.severity === 'warning' || (latest.data?.percentage_used ?? 0) >= 80);
        const isInfo = !isCritical && !isWarning;

        if (isCritical) {
          new Audio(ALERT_SOUND).play().catch(() => {});
        }

        // Determinasu warna header berdasarkan tingkat keparahan
        const headerBg = isCritical ? 'bg-[#FF0000]' : isWarning ? 'bg-[#FAFF00]' : 'bg-[#00E0FF]';
        const headerText = isCritical ? 'text-white' : 'text-black';

        toast.custom((t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              navigate(isBudgetAlert ? '/budgets' : '/notifications');
            }}
            className={`
              ${t.visible ? 'animate-in slide-in-from-top-full' : 'animate-out fade-out-0 slide-out-to-top-full'}
              max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-none cursor-pointer pointer-events-auto transition-all overflow-hidden
            `}
          >
            {/* Title Bar - Conditional Color */}
            <div className={`flex items-center justify-between p-3 border-b-4 border-black ${headerBg} ${headerText}`}>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm uppercase tracking-tighter italic">
                  {latest.title || (isBudgetAlert ? 'ANGGARAN' : 'NOTIFIKASI')}
                </h4>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
                className="w-7 h-7 border-2 border-black bg-white text-black flex items-center justify-center font-black hover:invert transition-all rounded-none"
              >✕</button>
            </div>
            
            {/* Body - Always White */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs font-black leading-tight uppercase tracking-wide text-black">
                {latest.message}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-[9px] font-black uppercase bg-black text-white px-2 py-1 flex items-center gap-1">
                  {isBudgetAlert ? 'PERIKSA SEKARANG' : 'LIHAT DETAIL'} 
                  <span className="animate-pulse">→</span>
                </div>
                {isCritical && (
                  <span className="text-[10px] font-black text-red-600 uppercase animate-bounce">PENTING!</span>
                )}
              </div>
            </div>
          </div>
        ), { 
          duration: isCritical ? 10000 : 5000,
          id: `notif-${latest.id}` 
        });
        
        // Sync list if user is on notification page
        qc.invalidateQueries({ queryKey: notificationKeys.list() });
      });
    }

    prevCountRef.current = currentCount;
  }, [countQuery.data?.unread_count, qc, navigate]);

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

export function useDeleteNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: notifApi.deleteNotification,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });

      const prevCount = qc.getQueryData(notificationKeys.count());
      const prevList = qc.getQueryData(notificationKeys.list());

      // Optimistic update: remove from list
      qc.setQueryData(notificationKeys.list(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(n => n.id !== id)
        };
      });

      // Optimistic update: adjust count if it was unread
      const deletedNotif = prevList?.data?.find(n => n.id === id);
      if (deletedNotif && !deletedNotif.is_read) {
        qc.setQueryData(notificationKeys.count(), (old) => ({
          unread_count: Math.max(0, (old?.unread_count ?? 1) - 1)
        }));
      }

      return { prevCount, prevList };
    },
    onError: (err, id, context) => {
      qc.setQueryData(notificationKeys.count(), context.prevCount);
      qc.setQueryData(notificationKeys.list(), context.prevList);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}

export function useClearAllNotifications() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: notifApi.clearAllNotifications,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });

      const prevCount = qc.getQueryData(notificationKeys.count());
      const prevList = qc.getQueryData(notificationKeys.list());

      // Optimistic update: empty everything
      qc.setQueryData(notificationKeys.count(), { unread_count: 0 });
      qc.setQueryData(notificationKeys.list(), { data: [], meta: { total: 0, unread_count: 0 } });

      return { prevCount, prevList };
    },
    onError: (err, variables, context) => {
      qc.setQueryData(notificationKeys.count(), context.prevCount);
      qc.setQueryData(notificationKeys.list(), context.prevList);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    }
  });
}
