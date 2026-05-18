import api from './axios';

export async function getMyPatientProfile() {
  const res = await api.get('/patients/me');
  return res.data.profile;
}

export async function saveMyPatientProfile(profile) {
  const res = await api.put('/patients/me', profile);
  return res.data.profile;
}
