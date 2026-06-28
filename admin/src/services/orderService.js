import api from '../utils/api';

export async function fetchOrders(params = {}) {
  const response = await api.get('/admin/orders', { params });
  return response.data;
}

export async function fetchOrder(id) {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
}

export async function updateOrder(id, payload) {
  const response = await api.patch(`/admin/orders/${id}`, payload);
  return response.data;
}
