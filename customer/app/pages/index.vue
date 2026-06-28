<template>
  <section class="hero">
    <div class="hero__content">
      <p class="hero__eyebrow">Welcome to RX Ecommerce</p>
      <h1>Shop smarter with curated products for every lifestyle.</h1>
      <p class="hero__intro">
        Browse our catalog, add items to your cart, and checkout securely.
        Track your orders and manage your account — all in one place.
      </p>
      <div class="hero__actions">
        <NuxtLink class="btn btn-primary" to="/products">Browse Products</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/account">Create Account</NuxtLink>
      </div>
    </div>
    <div class="hero__features">
      <article v-for="feature in features" :key="feature.title" class="feature-card">
        <span class="feature-card__icon">{{ feature.icon }}</span>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
const features = [
  { icon: '🚚', title: 'Fast Delivery', text: 'Quick shipping on all orders with real-time tracking.' },
  { icon: '🔒', title: 'Secure Checkout', text: 'Your data is protected with industry-standard security.' },
  { icon: '💎', title: 'Quality Products', text: 'Hand-picked items from trusted brands and suppliers.' },
];
</script>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero__content {
  background: linear-gradient(135deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%);
  color: white;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 24px 48px rgba(79, 70, 229, 0.3);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.8rem;
  font-weight: 700;
  opacity: 0.85;
  margin: 0 0 0.75rem;
}

.hero__content h1 {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  margin: 0 0 1rem;
  line-height: 1.2;
  max-width: 640px;
}

.hero__intro {
  font-size: 1.05rem;
  opacity: 0.9;
  max-width: 560px;
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero__features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: white;
  border-radius: 18px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.feature-card__icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
}

.feature-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
}

.feature-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero__content {
    padding: 2rem 1.5rem;
  }

  .hero__features {
    grid-template-columns: 1fr;
  }
}
</style>
