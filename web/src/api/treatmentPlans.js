import api from './axios';

export async function getTreatmentPlansByPatient(patientId) {
  const res = await api.get(`/treatment-plans/by-patient/${patientId}`);
  return res.data.plans;
}

export async function createTreatmentPlan(payload) {
  const res = await api.post('/treatment-plans', payload);
  return res.data;
}

export async function createTreatmentPlansBulk(payload) {
  const res = await api.post('/treatment-plans/bulk', payload);
  return res.data;
}

export async function updateTreatmentPlan(id, payload) {
  const res = await api.patch(`/treatment-plans/${id}`, payload);
  return res.data;
}

export async function deleteTreatmentPlan(id) {
  const res = await api.delete(`/treatment-plans/${id}`);
  return res.data;
}
