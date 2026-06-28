import api from '../utils/api';

export async function fetchDashboardSummary() {
  const response = await api.get('/admin/dashboard/summary');
  return response.data;
}
