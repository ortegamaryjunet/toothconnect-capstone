import api from './axios';

export async function listNotifications() {
  const res = await api.get('/notifications');
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res.data.unread_count;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch('/notifications/read-all');
  return res.data;
}