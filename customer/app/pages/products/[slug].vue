<template>
  <section v-if="loading" class="card empty-state">Loading product...</section>
  <section v-else-if="error" class="card alert alert-error">{{ error }}</section>
  <section v-else-if="product" class="product-detail">
    <div class="card product-detail__gallery">
      <img :src="imageUrl(product.image)" :alt="product.name" class="product-detail__image" />
    </div>
    <div class="card product-detail__info">
      <span class="product-card__category">{{ product.category_name }}</span>
      <h1>{{ product.name }}</h1>
      <p class="product-detail__price">${{ formatPrice(product.price) }}</p>
      <p class="product-detail__stock" :class="{ 'is-low': product.stock < 10 }">
        {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
      </p>
      <p class="product-detail__desc">{{ product.description }}</p>
      <div class="product-detail__actions">
        <div class="qty-control">
          <button class="btn btn-ghost" @click="quantity = Math.max(1, quantity - 1)">−</button>
          <span>{{ quantity }}</span>
          <button class="btn btn-ghost" @click="quantity = Math.min(product.stock, quantity + 1)">+</button>
        </div>
        <button
          class="btn btn-primary"
          :disabled="product.stock <= 0 || adding"
          @click="handleAdd"
        >
          {{ adding ? 'Adding...' : 'Add to cart' }}
        </button>
        <NuxtLink to="/cart" class="btn btn-secondary">View cart</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const route = useRoute();
const { apiFetch, imageUrl } = useApi();
const { addItem } = useCart();

const product = ref(null);
const loading = ref(true);
const error = ref('');
const quantity = ref(1);
const adding = ref(false);

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

async function loadProduct() {
  loading.value = true;
  error.value = '';

  try {
    const response = await apiFetch(`/products/slug/${route.params.slug}`);
    product.value = response.data;
  } catch {
    error.value = 'Product not found.';
    product.value = null;
  } finally {
    loading.value = false;
  }
}

async function handleAdd() {
  adding.value = true;
  try {
    await addItem(product.value, quantity.value);
  } finally {
    adding.value = false;
  }
}

watch(() => route.params.slug, loadProduct);
onMounted(loadProduct);
</script>

<style scoped>
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.product-detail__image {
  width: 100%;
  border-radius: 16px;
  aspect-ratio: 1;
  object-fit: cover;
  background: #f1f5f9;
}

.product-detail__info h1 {
  margin: 0.5rem 0;
  font-size: 1.75rem;
}

.product-detail__price {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1d4ed8;
  margin: 0.5rem 0;
}

.product-detail__stock {
  color: #16a34a;
  font-weight: 600;
  margin: 0 0 1rem;
}

.product-detail__stock.is-low {
  color: #d97706;
}

.product-detail__desc {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.product-detail__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 0.25rem;
}

.qty-control span {
  min-width: 32px;
  text-align: center;
  font-weight: 700;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}
</style>
