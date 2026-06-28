<template>
  <section class="card">
    <div class="section-header">
      <div>
        <h2>Shopping Cart</h2>
        <p>{{ countItems }} item(s) in your cart</p>
      </div>
      <NuxtLink v-if="cartItems.length" to="/checkout" class="btn btn-primary">Proceed to checkout</NuxtLink>
    </div>

    <div v-if="cartLoading" class="empty-state">Loading cart...</div>
    <div v-else-if="cartItems.length === 0" class="empty-state">
      <p>Your cart is empty.</p>
      <NuxtLink to="/products" class="btn btn-primary" style="margin-top: 1rem">Start shopping</NuxtLink>
    </div>
    <div v-else class="cart-layout">
      <div class="cart-items">
        <article v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="imageUrl(item.image)" :alt="item.name" class="cart-item__image" />
          <div class="cart-item__info">
            <h3>{{ item.name }}</h3>
            <p class="cart-item__price">${{ formatPrice(item.price) }} each</p>
            <div class="cart-item__controls">
              <button class="btn btn-ghost" @click="updateQuantity(item.id, item.quantity - 1)">−</button>
              <span>{{ item.quantity }}</span>
              <button class="btn btn-ghost" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
              <button class="btn btn-danger" @click="removeItem(item.id)">Remove</button>
            </div>
          </div>
          <p class="cart-item__total">${{ formatPrice(item.price * item.quantity) }}</p>
        </article>
      </div>
      <aside class="cart-summary card">
        <h3>Order Summary</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${{ formatPrice(subtotal) }}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div class="summary-row summary-row--total">
          <span>Total</span>
          <span>${{ formatPrice(subtotal) }}</span>
        </div>
        <NuxtLink to="/checkout" class="btn btn-primary" style="width: 100%; margin-top: 1rem">
          Checkout
        </NuxtLink>
      </aside>
    </div>
  </section>
</template>

<script setup>
const { imageUrl } = useApi();
const { cartItems, cartLoading, countItems, subtotal, updateQuantity, removeItem, fetchCart } = useCart();

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

onMounted(fetchCart);
</script>

<style scoped>
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fafbfc;
}

.cart-item__image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  background: #f1f5f9;
}

.cart-item__info {
  flex: 1;
}

.cart-item__info h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.cart-item__price {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.cart-item__controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.cart-item__total {
  font-weight: 800;
  font-size: 1.1rem;
  color: #1d4ed8;
  margin: 0;
}

.cart-summary h3 {
  margin: 0 0 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #64748b;
}

.summary-row--total {
  border-top: 1px solid #e2e8f0;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 800;
  color: #0f172a;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}
</style>
