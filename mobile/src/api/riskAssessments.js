import api from './axios';

export async function getPatientFactors() {
  const res = await api.get('/risk-assessments/factors');
  return res.data.factors;
}

export async function submitAssessment(factorCodes) {
  const res = await api.post('/risk-assessments', { factor_codes: factorCodes });
  return res.data;
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