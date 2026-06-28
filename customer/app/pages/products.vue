<template>
  <section class="card">
    <div class="section-header">
      <div>
        <h2>Products</h2>
        <p>Discover our full catalog with search and category filters.</p>
      </div>
    </div>

    <div class="filters-bar">
      <input
        v-model="search"
        type="search"
        placeholder="Search products..."
        @keyup.enter="loadProducts(1)"
      />
      <select v-model="categoryId" @change="loadProducts(1)">
        <option value="">All categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <select v-model="sortBy" @change="loadProducts(1)">
        <option value="created_at">Newest</option>
        <option value="price">Price Low - High</option>
      </select>
      <button class="btn btn-primary" @click="loadProducts(1)">Search</button>
    </div>

    <div v-if="loading" class="product-grid">
      <article v-for="i in 8" :key="i" class="product-card skeleton-card">
        <div class="skeleton-image"></div>
        <div class="product-card__body">
          <div class="skeleton-text skeleton-category"></div>
          <div class="skeleton-text skeleton-title"></div>
          <div class="skeleton-text skeleton-price"></div>
          <div class="skeleton-text skeleton-desc"></div>
          <div class="skeleton-button"></div>
        </div>
      </article>
    </div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="empty-state">No products found. Try a different search.</div>
    <div v-else class="product-grid">
      <article v-for="item in products" :key="item.id" class="product-card">
        <NuxtLink :to="`/products/${item.slug}`">
          <img
            :src="imageUrl(item.image)"
            :alt="item.name"
            class="product-card__image"
            loading="lazy"
            @error="handleImageError"
          />
        </NuxtLink>
        <div class="product-card__body">
          <span class="product-card__category">{{ item.category_name || 'General' }}</span>
          <NuxtLink :to="`/products/${item.slug}`" class="product-card__title">
            <h3>{{ item.name }}</h3>
          </NuxtLink>
          <p class="product-card__price">${{ formatPrice(item.price) }}</p>
          <p class="product-card__desc">{{ item.description }}</p>
          <button
            class="btn btn-primary"
            :disabled="adding === item.id || item.stock <= 0"
            @click="handleAdd(item)"
          >
            {{ item.stock <= 0 ? 'Out of stock' : adding === item.id ? 'Adding...' : 'Add to cart' }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-ghost" :disabled="page <= 1" @click="loadProducts(page - 1)">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button class="btn btn-ghost" :disabled="page >= totalPages" @click="loadProducts(page + 1)">Next</button>
    </div>
  </section>
</template>

<script setup>
const { apiFetch, imageUrl } = useApi();
const { addItem } = useCart();

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const categoryId = ref('');
const sortBy = ref('created_at');
const page = ref(1);
const totalPages = ref(1);
const adding = ref(null);

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

async function loadCategories() {
  try {
    const response = await apiFetch('/categories');
    categories.value = response.data || [];
  } catch {
    categories.value = [];
  }
}

async function loadProducts(nextPage = 1) {
  loading.value = true;
  error.value = '';
  page.value = nextPage;

  try {
    const query = new URLSearchParams({
      page: String(nextPage),
      limit: '12',
      sortBy: sortBy.value,
      sortOrder: sortBy.value === 'price' ? 'asc' : 'desc',
    });

    if (search.value.trim()) {
      query.set('search', search.value.trim());
    }
    if (categoryId.value) {
      query.set('categoryId', categoryId.value);
    }

    const response = await apiFetch(`/products?${query.toString()}`);
    products.value = response.data?.items || [];
    totalPages.value = response.data?.totalPages || 1;
  } catch {
    error.value = 'Unable to load products. Make sure the backend server is running.';
    products.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleAdd(product) {
  adding.value = product.id;
  try {
    await addItem(product);
  } finally {
    adding.value = null;
  }
}

function handleImageError(event) {
  event.target.src = 'https://placehold.co/600x400/f1f5f9/64748b?text=Image+Not+Available';
}

onMounted(async () => {
  await loadCategories();
  await loadProducts();
});
</script>

<style scoped>
.product-card__title {
  text-decoration: none;
  color: inherit;
}

.product-card__title h3 {
  margin: 0;
  font-size: 1rem;
}

.skeleton-card {
  pointer-events: none;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-category {
  width: 60px;
  height: 12px;
}

.skeleton-title {
  width: 80%;
  height: 20px;
  margin-bottom: 0.5rem;
}

.skeleton-price {
  width: 40%;
  height: 24px;
}

.skeleton-desc {
  width: 100%;
  height: 32px;
}

.skeleton-button {
  width: 100%;
  height: 42px;
  border-radius: 999px;
  margin-top: 0.5rem;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
