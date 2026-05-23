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

export async function createAppointment(payload) {
  const res = await api.post('/appointments', payload);
  return res.data;
}

export async function cancelAppointment(id, body = {}) {
  const res = await api.patch(`/appointments/${id}/cancel`, body);
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

export async function saveAppointmentNote(id, note) {
  const res = await api.patch(`/appointments/${id}/note`, { note });
  return res.data;
}

export async function getDentistBusySlots(dentistId, date) {
  const res = await api.get('/appointments/_meta/dentist-busy-slots', {
    params: { dentist_id: dentistId, date },
  });
  return res.data.appointments;
}
