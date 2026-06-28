<template>
  <section class="card">
    <div class="section-header">
      <div>
        <h2>My Orders</h2>
        <p>Track and review your purchase history.</p>
      </div>
    </div>

    <div v-if="!isLoggedIn" class="alert alert-info">
      Please <NuxtLink to="/account">sign in</NuxtLink> to view your orders.
    </div>

    <div v-else-if="loading" class="empty-state">Loading orders...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="empty-state">
      <p>You haven't placed any orders yet.</p>
      <NuxtLink to="/products" class="btn btn-primary" style="margin-top: 1rem">Start shopping</NuxtLink>
    </div>
    <div v-else class="orders-list">
      <article v-for="order in orders" :key="order.id" class="order-row">
        <div>
          <h3>Order #{{ order.id }}</h3>
          <p class="order-date">{{ formatDate(order.created_at) }}</p>
        </div>
        <div class="order-meta">
          <span :class="['badge', `badge-${order.status}`]">{{ order.status }}</span>
          <span :class="['badge', `badge-${order.payment_status}`]">{{ order.payment_status }}</span>
        </div>
        <p class="order-total">${{ formatPrice(order.total_amount) }}</p>
        <NuxtLink :to="`/orders/${order.id}`" class="btn btn-secondary">View details</NuxtLink>
      </article>
    </div>
  </section>
</template>

<script setup>
const { apiFetch } = useApi();
const { isLoggedIn } = useAuth();

const orders = ref([]);
const loading = ref(true);
const error = ref('');

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function loadOrders() {
  if (!isLoggedIn.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await apiFetch('/orders');
    orders.value = response.data || [];
  } catch {
    error.value = 'Unable to load orders.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadOrders);
watch(isLoggedIn, loadOrders);
</script>

<style scoped>
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  flex-wrap: wrap;
}

.order-row h3 {
  margin: 0;
  font-size: 1rem;
}

.order-date {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.order-meta {
  display: flex;
  gap: 0.4rem;
  flex: 1;
}

.order-total {
  font-weight: 800;
  color: #1d4ed8;
  margin: 0;
}

@media (max-width: 640px) {
  .order-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
