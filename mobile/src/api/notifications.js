import api from './axios';
import { setAppBadgeCount } from '../services/push';

async function syncAppBadgeCount(count) {
  if (Number.isFinite(Number(count))) {
    await setAppBadgeCount(count);
    return;
  }

  try {
    const res = await api.get('/notifications/unread-count');
    await setAppBadgeCount(res.data.unread_count);
  } catch (err) {
    console.log('[notifications] Failed to sync app badge:', err.message);
  }
}

export async function listNotifications() {
  const res = await api.get('/notifications');
  await syncAppBadgeCount(res.data.unread_count);
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  await setAppBadgeCount(res.data.unread_count);
  return res.data.unread_count;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  await syncAppBadgeCount(res.data.unread_count);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch('/notifications/read-all');
  await syncAppBadgeCount(res.data.unread_count);
  return res.data;
}
