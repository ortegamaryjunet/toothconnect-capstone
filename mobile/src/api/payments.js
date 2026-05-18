import api from './axios';

export async function getCloudinarySignature(payload = {}) {
  const res = await api.post('/payments/cloudinary-signature', payload);
  return res.data;
}

export async function uploadPaymentReceipt(payload) {
  const res = await api.post('/payments/receipts', payload);
  return res.data;
}
