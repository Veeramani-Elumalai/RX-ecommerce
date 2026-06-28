<template>
  <section class="card">
    <div class="section-header">
      <div>
        <h2>Checkout</h2>
        <p>Complete your order with shipping details.</p>
      </div>
    </div>

    <div v-if="!isLoggedIn" class="alert alert-info">
      Please <NuxtLink to="/account">sign in or create an account</NuxtLink> to checkout.
    </div>

    <div v-else-if="cartItems.length === 0" class="empty-state">
      <p>Your cart is empty.</p>
      <NuxtLink to="/products" class="btn btn-primary" style="margin-top: 1rem">Browse products</NuxtLink>
    </div>

    <div v-else class="checkout-layout">
      <form class="checkout-form" @submit.prevent="placeOrder">
        <h3>Shipping Address</h3>
        <div class="form-grid form-grid--2">
          <div class="field">
            <label>Full name</label>
            <input v-model="form.name" required />
          </div>
          <div class="field">
            <label>Phone</label>
            <input v-model="form.phone" required />
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label>Address line 1</label>
            <input v-model="form.line1" required />
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label>Address line 2 (optional)</label>
            <input v-model="form.line2" />
          </div>
          <div class="field">
            <label>City</label>
            <input v-model="form.city" required />
          </div>
          <div class="field">
            <label>State</label>
            <input v-model="form.state" required />
          </div>
          <div class="field">
            <label>ZIP code</label>
            <input v-model="form.zip" required />
          </div>
          <div class="field">
            <label>Country</label>
            <input v-model="form.country" required />
          </div>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>

        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Placing order...' : `Place order — $${formatPrice(subtotal)}` }}
        </button>
      </form>

      <aside class="order-summary card">
        <h3>Your Order</h3>
        <div v-for="item in cartItems" :key="item.id" class="summary-item">
          <span>{{ item.name }} × {{ item.quantity }}</span>
          <span>${{ formatPrice(item.price * item.quantity) }}</span>
        </div>
        <div class="summary-row summary-row--total">
          <span>Total</span>
          <span>${{ formatPrice(subtotal) }}</span>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
const router = useRouter();
const { apiFetch } = useApi();
const { isLoggedIn, user } = useAuth();
const { cartItems, subtotal, fetchCart, clearCart } = useCart();

const form = ref({
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
});

const submitting = ref(false);
const error = ref('');
const success = ref('');

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

onMounted(async () => {
  await fetchCart();
  if (user.value) {
    form.value.name = `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim();
    form.value.phone = user.value.phone || '';
  }
});

async function placeOrder() {
  submitting.value = true;
  error.value = '';
  success.value = '';

  try {
    const response = await apiFetch('/orders', {
      method: 'POST',
      body: {
        shippingAddress: { ...form.value },
        paymentStatus: 'paid',
      },
    });

    await clearCart();
    success.value = 'Order placed successfully! Redirecting...';
    setTimeout(() => {
      router.push(`/orders/${response.data.id}`);
    }, 1500);
  } catch (err) {
    error.value = err?.data?.message || 'Unable to place order. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  align-items: start;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkout-form h3 {
  margin: 0;
}

.order-summary h3 {
  margin: 0 0 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.9rem;
  color: #64748b;
}

.summary-row--total {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e2e8f0;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  font-weight: 800;
}

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}
</style>
