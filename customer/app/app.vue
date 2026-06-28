<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <Head>
      <Title>RX Ecommerce - Quality Products, Delivered Fast</Title>
      <Meta name="description" content="Shop the best products at RX Ecommerce. Fast delivery, secure checkout, and quality items for every lifestyle." />
      <Meta name="keywords" content="ecommerce, online shopping, products, fast delivery, secure checkout" />
      <Meta property="og:title" content="RX Ecommerce - Quality Products, Delivered Fast" />
      <Meta property="og:description" content="Shop the best products at RX Ecommerce. Fast delivery, secure checkout, and quality items for every lifestyle." />
      <Meta property="og:type" content="website" />
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <header class="topbar">
      <div class="topbar__inner page-container">
        <NuxtLink to="/" class="brand">
          <span class="brand__icon">RX</span>
          <span>RX Ecommerce</span>
        </NuxtLink>
        <nav class="nav-links">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/products">Products</NuxtLink>
          <NuxtLink to="/orders">Orders</NuxtLink>
        </nav>
        <div class="topbar__actions">
          <NuxtLink to="/account" class="account-link">
            {{ isLoggedIn ? user?.firstName : 'Sign in' }}
          </NuxtLink>
          <NuxtLink to="/cart" class="cart-pill">
            🛒 Cart
            <span v-if="countItems > 0" class="cart-count">{{ countItems }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="page-content page-container">
      <NuxtPage />
    </main>

    <footer class="footer">
      <div class="page-container footer__inner">
        <p>&copy; {{ new Date().getFullYear() }} RX Ecommerce. Quality products, delivered fast.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const { user, isLoggedIn, fetchMe } = useAuth();
const { countItems, fetchCart } = useCart();

onMounted(async () => {
  await fetchMe();
  await fetchCart();
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.topbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  font-weight: 800;
  color: #0f172a;
  font-size: 1.1rem;
}

.brand__icon {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
}

.nav-links {
  display: flex;
  gap: 1.25rem;
}

.nav-links a {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  transition: color 0.15s;
}

.nav-links a.router-link-active {
  color: #2563eb;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.account-link {
  text-decoration: none;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
}

.cart-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
}

.cart-count {
  background: white;
  color: #2563eb;
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
}

.page-content {
  flex: 1;
  padding: 2rem 1.5rem;
}

.footer {
  border-top: 1px solid #e2e8f0;
  background: white;
  padding: 1.25rem 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.footer__inner {
  text-align: center;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>
