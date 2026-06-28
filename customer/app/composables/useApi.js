export function useApi() {
  const config = useRuntimeConfig();

  function getToken() {
    if (!import.meta.client) {
      return null;
    }
    return localStorage.getItem('rx_token');
  }

  async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await $fetch(`${config.public.apiBase}${path}`, {
        ...options,
        headers,
      });
      return response;
    } catch (error) {
      const status = error?.response?.status || error?.statusCode;
      if (status === 401 && import.meta.client) {
        localStorage.removeItem('rx_token');
        localStorage.removeItem('rx_user');
      }
      throw error;
    }
  }

  function imageUrl(path) {
    if (!path) {
      return 'https://placehold.co/600x400/f1f5f9/64748b?text=No+Image';
    }
    if (path.startsWith('http')) {
      return path;
    }
    const base = config.public.apiBase.replace('/api', '');
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
    return url;
  }

  return { apiFetch, getToken, imageUrl };
}
