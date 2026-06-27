<template>
  <section class="hero-card">
    <div>
      <p class="eyebrow">New season</p>
      <h1>Discover quality products curated for modern living.</h1>
      <p class="intro">Browse featured products, manage your cart, and track your orders from a single storefront.</p>
      <div class="actions">
        <NuxtLink class="btn btn-primary" to="/products">Shop now</NuxtLink>
        <NuxtLink class="btn btn-ghost" to="/account">My account</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #4f46e5;
  font-weight: 700;
}
h1 {
  font-size: 2rem;
  margin: 0.5rem 0;
}
.intro {
  color: #475569;
  margin-top: 0.75rem;
  max-width: 680px;
}
.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.btn {
  display: inline-block;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
}
.btn-primary {
  background: #2563eb;
  color: white;
}
.btn-ghost {
  background: #eff6ff;
  color: #1d4ed8;
}
</style>
