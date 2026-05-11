import api from './axios';

export async function listMyPatients() {
  const res = await api.get('/appointments/_meta/my-patients');
  return res.data.patients;
}