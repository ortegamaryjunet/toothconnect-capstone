import api from './axios';

export function listAdminScheduleRequests() {
  return api.get('/dentist-dashboard/admin/schedule-requests').then(r => r.data);
}

export function updateScheduleRequest(id, status) {
  return api.patch(`/dentist-dashboard/admin/schedule-requests/${id}`, { status }).then(r => r.data);
}