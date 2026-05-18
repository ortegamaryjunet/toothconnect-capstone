import api from './axios';

export async function getClinicDentistPerformance(params = {}) {
  const res = await api.get('/reports/clinic-dentist-performance', { params });
  return res.data;
}

export async function getPatientSatisfactionReport(params = {}) {
  const res = await api.get('/reports/patient-satisfaction', { params });
  return res.data;
}

export async function getPatientVisitReport(params = {}) {
  const res = await api.get('/reports/patient-visits', { params });
  return res.data;
}

export async function getPatientTreatmentReport(params = {}) {
  const res = await api.get('/reports/patient-treatments', { params });
  return res.data;
}

export async function getStockAvailabilityReport(params = {}) {
  const res = await api.get('/reports/stock-availability', { params });
  return res.data;
}

export async function getConsumptionReport(params = {}) {
  const res = await api.get('/reports/consumption', { params });
  return res.data;
}

export async function getAdminDashboardReport(params = {}) {
  const res = await api.get('/reports/admin-dashboard', { params });
  return res.data;
}
