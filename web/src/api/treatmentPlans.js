import api from './axios';

export async function getTreatmentPlansByPatient(patientId) {
  const res = await api.get(`/treatment-plans/by-patient/${patientId}`);
  return res.data.plans;
}

export async function createTreatmentPlan(payload) {
  const res = await api.post('/treatment-plans', payload);
  return res.data;
}

export async function createTreatmentPlansBulk(payload) {
  const res = await api.post('/treatment-plans/bulk', payload);
  return res.data;
}

export async function updateTreatmentPlan(id, payload) {
  const res = await api.patch(`/treatment-plans/${id}`, payload);
  return res.data;
}

export async function deleteTreatmentPlan(id) {
  const res = await api.delete(`/treatment-plans/${id}`);
  return res.data;
}

export async function getTreatmentPlanAttachments(id) {
  const res = await api.get(`/treatment-plans/${id}/attachments`);
  return res.data.attachments;
}

export async function uploadTreatmentPlanAttachments(id, files) {
  const formData = new FormData();
  Array.from(files || []).forEach((file) => {
    formData.append('attachments', file);
  });

  const res = await api.post(`/treatment-plans/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.attachments;
}

export async function deleteTreatmentPlanAttachment(attachmentId) {
  const res = await api.delete(`/treatment-plans/attachments/${attachmentId}`);
  return res.data;
}
