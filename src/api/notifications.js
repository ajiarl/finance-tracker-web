import api from './axios';

export const fetchNotifications = () => 
  api.get('/notifications').then(res => res.data);

export const fetchUnreadCount = () => 
  api.get('/notifications', { params: { count_only: 1 } }).then(res => res.data);

export const markAsRead = (id) => 
  api.patch(`/notifications/${id}/read`).then(res => res.data);

export const markAllAsRead = () => 
  api.patch('/notifications/read-all').then(res => res.data);

export const deleteNotification = (id) => 
  api.delete(`/notifications/${id}`).then(res => res.data);

export const clearAllNotifications = () => 
  api.delete('/notifications/clear-all').then(res => res.data);
