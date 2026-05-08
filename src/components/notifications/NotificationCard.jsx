import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bell, Target, Info, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  budget_alert: {
    icon: Target,
    bg: 'bg-orange-400',
    border: 'border-orange-600',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-400',
    border: 'border-blue-600',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-400',
    border: 'border-yellow-600',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-500',
    border: 'border-red-600',
  },
};

export default function NotificationCard({ notification, onMarkAsRead }) {
  const navigate = useNavigate();
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Deep-linking logic based on new 'data' field
    if (notification.data?.budget_id) {
      navigate('/budgets');
    } else if (notification.data?.report_id) {
      navigate('/reports');
    } else if (notification.data?.suggestion === 'create_budget') {
      navigate(`/budgets?category_id=${notification.data.category_id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative flex items-start gap-4 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none group ${
        notification.is_read ? 'bg-white opacity-70' : 'bg-[#FAFF00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
      }`}
    >
      {/* Left Accent Strip */}
      {!notification.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${config.bg}`}>
        <Icon size={20} strokeWidth={3} className="text-black" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`text-sm font-black uppercase tracking-tight truncate ${notification.is_read ? 'text-gray-500' : 'text-black'}`}>
            {notification.title}
          </h3>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap ml-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: id })}
          </span>
        </div>
        <p className={`text-xs leading-relaxed ${notification.is_read ? 'text-gray-400' : 'text-black font-bold'}`}>
          {notification.message}
        </p>

        {/* Action Button Label for Deep Linking */}
        {(notification.data?.budget_id || notification.data?.suggestion === 'create_budget') && !notification.is_read && (
          <div className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black underline decoration-2">
            {notification.data?.suggestion === 'create_budget' ? 'Buat Anggaran' : 'Lihat Anggaran'} <ChevronRight size={12} strokeWidth={4} />
          </div>
        )}
      </div>
    </div>
  );
}
