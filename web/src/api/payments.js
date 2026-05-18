import api from './axios';

export async function getRevenueReport(params = {}) {
  const res = await api.get('/payments/reports/revenue', { params });
  return res.data;
}

export async function listPayments(params = {}) {
  const res = await api.get('/payments', { params });
  return res.data.payments;
}

export async function updatePaymentStatus(id, payload) {
  const res = await api.patch(`/payments/${id}/status`, payload);
  return res.data;
}

export async function reopenReceiptUpload(id) {
  const res = await api.patch(`/payments/${id}/reopen-upload`);
  return res.data;
}

export async function updatePaymentAmount(id, payload) {
  const res = await api.patch(`/payments/${id}/amount`, payload);
  return res.data;
}

export async function createStaffPayment(payload) {
  const res = await api.post('/payments/staff', payload);
  return res.data;
}

export async function listExpenses(params = {}) {
  const res = await api.get('/payments/expenses', { params });
  return res.data.expenses;
}

export async function createExpense(payload) {
  const res = await api.post('/payments/expenses', payload);
  return res.data;
}
