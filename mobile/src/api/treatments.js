import api from './axios';

export async function getTreatmentsByPatient(patientId) {
  const res = await api.get(`/treatments/by-patient/${patientId}`);
  return res.data;
}

export async function getConditions() {
  const res = await api.get('/treatments/conditions');
  return res.data.conditions;
}