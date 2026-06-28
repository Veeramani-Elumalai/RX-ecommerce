export function useAuth() {
  const user = useState('auth-user', () => null);
  const { apiFetch } = useApi();
  const { syncGuestCart } = useCart();

  function loadFromStorage() {
    if (!import.meta.client) {
      return;
    }
    const stored = localStorage.getItem('rx_user');
    if (stored) {
      try {
        user.value = JSON.parse(stored);
      } catch {
        user.value = null;
      }
    }
  }

  async function fetchMe() {
    const token = import.meta.client ? localStorage.getItem('rx_token') : null;
    if (!token) {
      user.value = null;
      return null;
    }

    try {
      const response = await apiFetch('/auth/me');
      user.value = response.data;
      if (import.meta.client) {
        localStorage.setItem('rx_user', JSON.stringify(response.data));
      }
      return response.data;
    } catch {
      user.value = null;
      if (import.meta.client) {
        localStorage.removeItem('rx_token');
        localStorage.removeItem('rx_user');
      }
      return null;
    }
  }

  async function register(payload) {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: payload,
    });
    return response;
  }

  async function login(payload) {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: payload,
    });

    if (import.meta.client) {
      localStorage.setItem('rx_token', response.data.token);
      localStorage.setItem('rx_user', JSON.stringify(response.data.user));
    }

    user.value = response.data.user;
    await syncGuestCart();
    await fetchMe();
    return response;
  }

  function logout() {
    user.value = null;
    if (import.meta.client) {
      localStorage.removeItem('rx_token');
      localStorage.removeItem('rx_user');
    }
  }

  const isLoggedIn = computed(() => Boolean(user.value?.id));

  if (import.meta.client) {
    loadFromStorage();
  }

  return {
    user,
    isLoggedIn,
    register,
    login,
    logout,
    fetchMe,
  };
}
