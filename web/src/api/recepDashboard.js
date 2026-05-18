import api from './axios';

export async function fetchRecepDashboard({ visitMonth, visitYear } = {}) {
  const params = {};
  if (visitMonth !== undefined) params.visit_month = visitMonth;
  if (visitYear !== undefined) params.visit_year = visitYear;
  const res = await api.get('/recep-dashboard', { params });
  return res.data;
}
