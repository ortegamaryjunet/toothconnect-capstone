import api from './axios';

export function listAuditLogs(params = {}) {
  return api.get('/dentist-dashboard/admin/audit-logs', { params }).then(r => r.data);
}