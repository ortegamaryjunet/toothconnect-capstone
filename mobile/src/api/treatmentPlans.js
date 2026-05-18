import api from './axios';

export async function getTreatmentPlansByPatient(patientId) {
  const res = await api.get(`/treatment-plans/by-patient/${patientId}`);
  return res.data;
}
