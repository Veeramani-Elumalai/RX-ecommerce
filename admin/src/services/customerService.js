import api from '../utils/api';

export async function fetchCustomers(params = {}) {
  const response = await api.get('/admin/customers', { params });
  return response.data;
}

export async function updateCustomer(id, payload) {
  const response = await api.patch(`/admin/customers/${id}`, payload);
  return response.data;
}
