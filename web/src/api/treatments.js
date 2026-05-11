import api from './axios';

export async function getConditions() {
  const res = await api.get('/treatments/conditions');
  return res.data.conditions;
}

export async function getTreatmentsByPatient(patientId) {
  const res = await api.get(`/treatments/by-patient/${patientId}`);
  return res.data;
}

export async function createTreatment(payload) {
  const res = await api.post('/treatments', payload);
  return res.data;
}

export async function deleteTreatment(id) {
  const res = await api.delete(`/treatments/${id}`);
  return res.data;
}