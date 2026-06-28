<template>
  <section v-if="loading" class="card empty-state">Loading order...</section>
  <section v-else-if="error" class="card alert alert-error">{{ error }}</section>
  <section v-else-if="order" class="card">
    <div class="section-header">
      <div>
        <h2>Order #{{ order.id }}</h2>
        <p>Placed on {{ formatDate(order.created_at) }}</p>
      </div>
      <div class="order-badges">
        <span :class="['badge', `badge-${order.status}`]">{{ order.status }}</span>
        <span :class="['badge', `badge-${order.payment_status}`]">{{ order.payment_status }}</span>
      </div>
    </div>

    <div class="order-layout">
      <div>
        <h3>Items</h3>
        <div class="order-items">
          <article v-for="item in order.items" :key="item.product_id" class="order-item">
            <img :src="imageUrl(item.image)" :alt="item.name" class="order-item__image" />
            <div>
              <h4>{{ item.name }}</h4>
              <p>Qty: {{ item.quantity }} × ${{ formatPrice(item.unit_price) }}</p>
            </div>
            <p class="order-item__total">${{ formatPrice(item.subtotal) }}</p>
          </article>
        </div>
      </div>
      <aside class="order-sidebar">
        <h3>Shipping</h3>
        <address v-if="shippingAddress">
          {{ shippingAddress.name }}<br />
          {{ shippingAddress.line1 }}<br />
          <span v-if="shippingAddress.line2">{{ shippingAddress.line2 }}<br /></span>
          {{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.zip }}<br />
          {{ shippingAddress.country }}
        </address>
        <div class="order-total-box">
          <span>Total</span>
          <strong>${{ formatPrice(order.total_amount) }}</strong>
        </div>
        <NuxtLink to="/orders" class="btn btn-secondary" style="margin-top: 1rem">Back to orders</NuxtLink>
      </aside>
    </div>
  </section>
</template>

<script setup>
const route = useRoute();
const { apiFetch, imageUrl } = useApi();
const { isLoggedIn } = useAuth();

const order = ref(null);
const loading = ref(true);
const error = ref('');

const shippingAddress = computed(() => {
  if (!order.value?.shipping_address) {
    return null;
  }
  if (typeof order.value.shipping_address === 'string') {
    try {
      return JSON.parse(order.value.shipping_address);
    } catch {
      return null;
    }
  }
  return order.value.shipping_address;
});

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadOrder() {
  if (!isLoggedIn.value) {
    error.value = 'Please sign in to view this order.';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await apiFetch(`/orders/${route.params.id}`);
    const rows = response.data || [];
    if (!rows.length) {
      error.value = 'Order not found.';
      return;
    }

    const header = rows[0];
    order.value = {
      id: header.id,
      total_amount: header.total_amount,
      status: header.status,
      payment_status: header.payment_status,
      shipping_address: header.shipping_address,
      created_at: header.created_at,
      items: rows.filter((row) => row.product_id).map((row) => ({
        product_id: row.product_id,
        name: row.name,
        image: row.image,
        quantity: row.quantity,
        unit_price: row.unit_price,
        subtotal: row.subtotal,
      })),
    };
  } catch {
    error.value = 'Unable to load order details.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadOrder);
</script>

<style scoped>
.order-badges {
  display: flex;
  gap: 0.4rem;
}

.order-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  margin-top: 1rem;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.order-item__image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.order-item h4 {
  margin: 0 0 0.2rem;
  font-size: 0.95rem;
}

.order-item p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.order-item__total {
  margin-left: auto;
  font-weight: 700;
  color: #1d4ed8;
}

.order-sidebar address {
  font-style: normal;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.order-total-box {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .order-layout {
    grid-template-columns: 1fr;
  }
}
</style>
