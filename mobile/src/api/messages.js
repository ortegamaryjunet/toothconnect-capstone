import api from './axios';

export async function listThreads() {
  const res = await api.get('/messages/threads');
  return res.data.threads;
}

export async function getThread(otherUserId) {
  const res = await api.get(`/messages/thread/${otherUserId}`);
  return res.data.messages;
}

export async function sendMessage(payload) {
  const res = await api.post('/messages', payload);
  return res.data;
}

export async function markThreadRead(otherUserId) {
  const res = await api.patch(`/messages/thread/${otherUserId}/read`);
  return res.data;
}

export async function sendPresenceHeartbeat() {
  const res = await api.post('/messages/presence/heartbeat');
  return res.data;
}

export async function getPresence(userId) {
  const res = await api.get(`/messages/presence/${userId}`);
  return res.data.presence;
}

export async function listReceptionContacts() {
  const res = await api.get('/messages/contacts');
  return res.data.contacts;
}

export async function listMessageBranches() {
  const res = await api.get('/messages/branches');
  return res.data.branches;
}
