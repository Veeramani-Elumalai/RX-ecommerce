const GUEST_KEY = 'rx-cart';

export function useCart() {
  const cartItems = useState('cart-items', () => []);
  const cartLoading = useState('cart-loading', () => false);
  const authUser = useState('auth-user', () => null);
  const { apiFetch } = useApi();
  const isLoggedIn = computed(() => Boolean(authUser.value?.id));

  function loadGuestCart() {
    if (!import.meta.client) {
      return;
    }
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cartItems.value = parsed;
        }
      }
    } catch {
      cartItems.value = [];
    }
  }

  function persistGuestCart() {
    if (!import.meta.client) {
      return;
    }
    localStorage.setItem(GUEST_KEY, JSON.stringify(cartItems.value));
  }

  function normalizeServerItem(item) {
    return {
      id: item.product_id,
      itemId: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: Number(item.price),
      quantity: item.quantity,
      stock: item.stock,
    };
  }

  async function fetchCart() {
    if (!isLoggedIn.value) {
      loadGuestCart();
      return cartItems.value;
    }

    cartLoading.value = true;
    try {
      const response = await apiFetch('/cart');
      cartItems.value = (response.data?.items || []).map(normalizeServerItem);
      return cartItems.value;
    } finally {
      cartLoading.value = false;
    }
  }

  async function syncGuestCart() {
    if (!import.meta.client || !isLoggedIn.value) {
      return;
    }

    const guestItems = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    for (const item of guestItems) {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: { productId: item.id, quantity: item.quantity },
      });
    }

    localStorage.removeItem(GUEST_KEY);
    await fetchCart();
  }

  async function addItem(product, quantity = 1) {
    if (isLoggedIn.value) {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: { productId: product.id, quantity },
      });
      await fetchCart();
      return cartItems.value;
    }

    const existing = cartItems.value.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: Number(product.price),
        quantity,
        stock: product.stock,
      });
    }

    persistGuestCart();
    return cartItems.value;
  }

  async function removeItem(productId) {
    if (isLoggedIn.value) {
      const item = cartItems.value.find((entry) => entry.id === productId);
      if (item?.itemId) {
        await apiFetch(`/cart/items/${item.itemId}`, { method: 'DELETE' });
      }
      await fetchCart();
      return cartItems.value;
    }

    cartItems.value = cartItems.value.filter((item) => item.id !== productId);
    persistGuestCart();
    return cartItems.value;
  }

  async function updateQuantity(productId, quantity) {
    const nextQuantity = Math.max(0, quantity);

    if (isLoggedIn.value) {
      const item = cartItems.value.find((entry) => entry.id === productId);
      if (!item?.itemId) {
        return cartItems.value;
      }

      if (nextQuantity === 0) {
        await apiFetch(`/cart/items/${item.itemId}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/cart/items/${item.itemId}`, {
          method: 'PUT',
          body: { quantity: nextQuantity },
        });
      }
      await fetchCart();
      return cartItems.value;
    }

    cartItems.value = cartItems.value
      .map((item) => (item.id === productId ? { ...item, quantity: nextQuantity } : item))
      .filter((item) => item.quantity > 0);
    persistGuestCart();
    return cartItems.value;
  }

  async function clearCart() {
    if (isLoggedIn.value) {
      await apiFetch('/cart', { method: 'DELETE' });
    }
    cartItems.value = [];
    if (import.meta.client) {
      localStorage.removeItem(GUEST_KEY);
    }
    return cartItems.value;
  }

  const countItems = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0));

  const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0));

  if (import.meta.client) {
    loadGuestCart();
  }

  return {
    cartItems,
    cartLoading,
    fetchCart,
    syncGuestCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    countItems,
    subtotal,
  };
}
