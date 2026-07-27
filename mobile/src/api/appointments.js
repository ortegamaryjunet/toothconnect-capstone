import api from './axios';

export async function listAppointments(params = {}) {
  const res = await api.get('/appointments', { params });
  return res.data.appointments;
}

export async function getAppointment(id) {
  const res = await api.get(`/appointments/${id}`);
  return res.data.appointment;
}

export async function getAppointmentMeta() {
  const res = await api.get('/appointments/_meta/services-and-branches');
  return res.data;
}

export async function getCancellationPolicy() {
  const res = await api.get('/appointments/settings/cancellation-policy');
  return res.data.policy;
}

export async function createAppointment(payload) {
  const res = await api.post('/appointments', payload);
  return res.data;
}

export async function cancelAppointment(id, body = {}) {
  const res = await api.patch(`/appointments/${id}/cancel`, body);
  return res.data;
}

export async function suggestSlots(payload) {
  const res = await api.post('/appointments/suggest', payload);
  return res.data;
}

export async function checkAppointmentConflict(payload) {
  const res = await api.post('/appointments/conflict-check', payload);
  return res.data;
}

export async function getAppointmentFeedback(appointmentId) {
  const res = await api.get(`/appointments/patient-feedback/appointment/${appointmentId}`);
  return res.data;
}

export async function submitAppointmentFeedback(appointmentId, { rating, feedback }) {
  const res = await api.post(`/appointments/patient-feedback/appointment/${appointmentId}`, { rating, feedback });
  return res.data;
}
