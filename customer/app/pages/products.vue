<template>
  <section class="card">
    <div class="section-header">
      <div>
        <h2>Products</h2>
        <p>Browse the catalogue from the backend API.</p>
      </div>
    </div>
    <div v-if="loading" class="state">Loading products…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else class="product-grid">
      <article v-for="item in products" :key="item.id" class="product-card">
        <h3>{{ item.name }}</h3>
        <p class="price">${{ Number(item.price).toFixed(2) }}</p>
        <p class="muted">{{ item.category_name || 'General' }}</p>
        <button class="btn" @click="addToCart(item.id)">Add to cart</button>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const products = ref([]);
const loading = ref(true);
const error = ref('');

async function loadProducts() {
  try {
    const response = await $fetch('http://localhost:5000/api/products');
    products.value = response.data?.items || response.data || [];
  } catch (err) {
    error.value = 'Unable to load products.';
  } finally {
    loading.value = false;
  }
}

async function addToCart(productId) {
  try {
    await $fetch('http://localhost:5000/api/cart/items', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('customer_token') || ''}`,
      },
      body: { productId, quantity: 1 },
    });
    alert('Added to cart');
  } catch (err) {
    alert('Please login first');
  }
}

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.card {
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}
.section-header {
  margin-bottom: 1rem;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
}
.price {
  font-weight: 700;
  color: #1d4ed8;
}
.muted {
  color: #64748b;
}
.btn {
  margin-top: 0.75rem;
  border: none;
  border-radius: 999px;
  padding: 0.7rem 0.95rem;
  background: #2563eb;
  color: white;
  cursor: pointer;
}
.state {
  padding: 1rem 0;
}
.error {
  color: #b91c1c;
}
</style>
