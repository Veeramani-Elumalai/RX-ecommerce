 <template>
  <section class="account-page">
    <div v-if="isLoggedIn" class="card account-profile">
      <div class="section-header">
        <div>
          <h2>My Account</h2>
          <p>Welcome back, {{ user?.firstName }}!</p>
        </div>
        <button class="btn btn-ghost" @click="handleLogout">Sign out</button>
      </div>
      <div class="profile-details">
        <p><strong>Name:</strong> {{ user?.firstName }} {{ user?.lastName }}</p>
        <p><strong>Email:</strong> {{ user?.email }}</p>
        <p v-if="user?.phone"><strong>Phone:</strong> {{ user?.phone }}</p>
      </div>
      <div class="profile-actions">
        <NuxtLink to="/orders" class="btn btn-secondary">View my orders</NuxtLink>
        <NuxtLink to="/products" class="btn btn-primary">Continue shopping</NuxtLink>
      </div>
    </div>

    <div v-else class="auth-layout">
      <form class="card auth-card" @submit.prevent="handleLogin">
        <h2>Sign In</h2>
        <p class="auth-subtitle">Access your account to checkout and track orders.</p>
        <div v-if="loginError" class="alert alert-error">{{ loginError }}</div>
        <div class="field">
          <label>Email</label>
          <input v-model="loginForm.email" type="email" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="loginForm.password" type="password" required />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loginLoading">
          {{ loginLoading ? 'Signing in...' : 'Sign in' }}
        </button>
        <p class="demo-credentials">
          Demo: customer@rxecommerce.com / customer123
        </p>
      </form>

      <form class="card auth-card" @submit.prevent="handleRegister">
        <h2>Create Account</h2>
        <p class="auth-subtitle">Register to save your cart and order history.</p>
        <div v-if="registerError" class="alert alert-error">{{ registerError }}</div>
        <div class="form-grid form-grid--2">
          <div class="field">
            <label>First name</label>
            <input v-model="registerForm.firstName" required />
          </div>
          <div class="field">
            <label>Last name</label>
            <input v-model="registerForm.lastName" required />
          </div>
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="registerForm.email" type="email" required />
        </div>
        <div class="field">
          <label>Phone</label>
          <input v-model="registerForm.phone" required />
        </div>
        <div class="field">
          <label>Password (min 8 characters)</label>
          <input v-model="registerForm.password" type="password" minlength="8" required />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="registerLoading">
          {{ registerLoading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
const router = useRouter();
const { user, isLoggedIn, login, logout, register } = useAuth();

const loginForm = ref({ email: '', password: '' });
const registerForm = ref({ firstName: '', lastName: '', email: '', phone: '', password: '' });
const loginLoading = ref(false);
const registerLoading = ref(false);
const loginError = ref('');
const registerError = ref('');

async function handleLogin() {
  loginLoading.value = true;
  loginError.value = '';
  try {
    await login(loginForm.value);
    router.push('/products');
  } catch (err) {
    loginError.value = err?.data?.message || 'Invalid email or password.';
  } finally {
    loginLoading.value = false;
  }
}

async function handleRegister() {
  registerLoading.value = true;
  registerError.value = '';
  try {
    await register(registerForm.value);
    await login({ email: registerForm.value.email, password: registerForm.value.password });
    router.push('/products');
  } catch (err) {
    registerError.value = err?.data?.message || 'Unable to create account.';
  } finally {
    registerLoading.value = false;
  }
}

function handleLogout() {
  logout();
}
</script>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.auth-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-card h2 {
  margin: 0;
}

.auth-subtitle {
  color: #64748b;
  margin: 0;
}

.demo-credentials {
  font-size: 0.85rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 10px;
  margin: 0;
}

.profile-details p {
  margin: 0.35rem 0;
  color: #475569;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}
</style>
