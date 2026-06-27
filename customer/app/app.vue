<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <header class="topbar">
      <NuxtLink to="/" class="brand">RX Ecommerce</NuxtLink>
      <nav class="nav-links">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/products">Products</NuxtLink>
        <NuxtLink to="/cart">Cart</NuxtLink>
        <NuxtLink to="/account">Account</NuxtLink>
      </nav>
    </header>

    <main class="page-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  color: #0f172a;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}
.brand {
  font-size: 1.2rem;
  font-weight: 800;
  text-decoration: none;
  color: #111827;
}
.nav-links {
  display: flex;
  gap: 1rem;
}
.nav-links a {
  text-decoration: none;
  color: #475569;
  font-weight: 600;
}
.page-content {
  padding: 1.5rem;
}
</style>
