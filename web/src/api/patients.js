import api from './axios';

export async function listMyPatients() {
  const res = await api.get('/appointments/_meta/my-patients');
  return res.data.patients;
}

export async function listPatients() {
  const res = await api.get('/patients');
  return res.data.patients;
}

export async function searchPatients(query) {
  const res = await api.get('/patients/search', { params: { q: query } });
  return res.data.patients;
}

export async function createStaffPatient(payload) {
  const res = await api.post('/patients/staff', payload);
  return res.data.patient;
}

export async function updatePatientContact(patientId, payload) {
  const res = await api.patch(`/patients/${patientId}/contact`, payload);
  return res.data.patient;
}

export async function updatePatientAccount(patientId, payload) {
  const res = await api.patch(`/patients/${patientId}/account`, payload);
  return res.data.patient;
}

export async function getPatientProfile(patientId) {
  const res = await api.get(`/patients/${patientId}/profile`);
  return res.data.profile;
}

export async function updateStaffPatientProfile(patientId, payload) {
  const res = await api.put(`/patients/${patientId}/profile`, payload);
  return res.data.profile;
}
