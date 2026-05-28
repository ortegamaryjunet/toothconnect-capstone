import api from './axios';

export async function listSupplies(branchId) {
  const res = await api.get('/inventory/supplies', {
    params: branchId ? { branch_id: branchId } : {},
  });
  return res.data.supplies;
}

export async function listMedicines(branchId) {
  const res = await api.get('/inventory/medicines', {
    params: branchId ? { branch_id: branchId } : {},
  });
  return res.data.medicines;
}

export async function listEquipment(branchId) {
  const res = await api.get('/inventory/equipment', {
    params: branchId ? { branch_id: branchId } : {},
  });
  return res.data.equipment;
}

export async function getLowStockSummary(branchId) {
  const res = await api.get('/inventory/low-stock-summary', { params: { branch_id: branchId } });
  return res.data;
}

export async function createSupply(payload) {
  const res = await api.post('/inventory/supplies', payload);
  return res.data;
}

export async function createMedicine(payload) {
  const res = await api.post('/inventory/medicines', payload);
  return res.data;
}

export async function createEquipment(payload) {
  const res = await api.post('/inventory/equipment', payload);
  return res.data;
}

export async function createInventoryPurchaseExpense(payload) {
  const res = await api.post('/inventory/purchase-expenses', payload);
  return res.data;
}

export async function updateSupply(id, payload) {
  const res = await api.patch(`/inventory/supplies/${id}`, payload);
  return res.data;
}

export async function updateMedicine(id, payload) {
  const res = await api.patch(`/inventory/medicines/${id}`, payload);
  return res.data;
}

export async function updateEquipment(id, payload) {
  const res = await api.patch(`/inventory/equipment/${id}`, payload);
  return res.data;
}

export async function restockSupply(id, amount) {
  const res = await api.post(`/inventory/supplies/${id}/restock`, { amount });
  return res.data;
}

export async function restockMedicine(id, amount) {
  const res = await api.post(`/inventory/medicines/${id}/restock`, { amount });
  return res.data;
}

export async function getServiceKit(serviceId, branchId) {
  const res = await api.get(`/inventory/service-kits/${serviceId}`, {
    params: { branch_id: branchId },
  });
  return res.data;
}

export async function getConsumption(appointmentId) {
  const res = await api.get(`/inventory/appointments/${appointmentId}/consumption`);
  return res.data;
}

export async function getManageServiceKit(serviceId, branchId) {
  const res = await api.get(`/inventory/service-kits/${serviceId}`, {
    params: branchId ? { branch_id: branchId } : {},
  });
  return res.data;
}

export async function saveManageServiceKit(serviceId, payload) {
  const res = await api.put(`/inventory/service-kits/${serviceId}`, payload);
  return res.data;
}

export async function submitConsumption(appointmentId, items) {
  const res = await api.post(`/inventory/appointments/${appointmentId}/consumption`, { items });
  return res.data;
}

export async function updateConsumption(appointmentId, items) {
  const res = await api.put(`/inventory/appointments/${appointmentId}/consumption`, { items });
  return res.data;
}

export async function listInventoryUsageHistory(params = {}) {
  const res = await api.get('/inventory/usage-history', { params });
  return res.data.records || [];
}
