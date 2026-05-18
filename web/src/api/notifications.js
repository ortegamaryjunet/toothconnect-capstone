import api from './axios';

export async function listNotifications(params = {}) {
  const res = await api.get('/notifications', { params });
  return res.data;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function getUnreadNotificationCount() {
  const res = await api.get('/notifications/unread-count');
  return Number(res.data.unread_count || 0);
}

export async function markAllNotificationsRead() {
  const res = await api.patch('/notifications/read-all');
  return res.data;
}

export async function sendTestLowStockNotification() {
  const res = await api.post('/notifications/test-low-stock');
  return res.data;
}
