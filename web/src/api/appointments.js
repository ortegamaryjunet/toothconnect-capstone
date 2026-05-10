import api from './axios';

export async function listAppointments(params = {}) {
  const res = await api.get('/appointments', { params });
  return res.data.appointments;
}

export async function getAppointment(id) {
  const res = await api.get(`/appointments/${id}`);
  return res.data.appointment;
}

export async function createAppointment(payload) {
  const res = await api.post('/appointments', payload);
  return res.data;
}

export async function cancelAppointment(id) {
  const res = await api.patch(`/appointments/${id}/cancel`);
  return res.data;
}

export async function setAppointmentStatus(id, status) {
  const res = await api.patch(`/appointments/${id}/status`, { status });
  return res.data;
}

export async function suggestSlots(payload) {
  const res = await api.post('/appointments/suggest', payload);
  return res.data;
}