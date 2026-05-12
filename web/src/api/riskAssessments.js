import api from './axios';

export async function getFactorsFull() {
  const res = await api.get('/risk-assessments/factors', { params: { view: 'full' } });
  return res.data.factors;
}

export async function getLatestAssessment(patientId, role) {
  const params = role ? { role } : {};
  const res = await api.get(`/risk-assessments/patient/${patientId}/latest`, { params });
  return res.data.assessment;
}

export async function listAssessments(patientId) {
  const res = await api.get(`/risk-assessments/patient/${patientId}`);
  return res.data.assessments;
}

export async function verifyAssessment(payload) {
  const res = await api.post('/risk-assessments', payload);
  return res.data;
}