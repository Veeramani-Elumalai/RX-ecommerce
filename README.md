# RX Ecommerce

Full-stack eCommerce platform with a **Nuxt.js** customer storefront, **React** admin dashboard, **Node.js + Express** API, and **MySQL** database.

## Features

### Customer Website (Nuxt.js)
- User registration and login
- Product listing with search, category filter, and pagination
- Product detail pages
- Shopping cart (guest localStorage + server sync when logged in)
- Checkout with shipping address
- Order history and order details

### Admin Dashboard (React)
- Admin login with role-based access
- Dashboard with sales, orders, customers, and low-stock statistics
- Product management (CRUD with image upload)
- Category management (CRUD)
- Order management (list, filter, update status/payment)
- Customer management (list, activate/deactivate)

### Backend (Node.js + Express)
- JWT authentication
- RESTful API for products, categories, cart, orders, and admin operations
- MySQL with transactional order placement and stock deduction

---

## Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8.0+

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Veeramani-Elumalai/RX-ecommerce.
cd RX-ecommerce
```

### 2. Set up the database

Create the database and import schema + seed data:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rx_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p rx_ecommerce < database/ecommerce.sql
```

The SQL file includes table definitions and sample data (categories, products, users).

**Default credentials:**

| Role     | Email                      | Password     |
|----------|----------------------------|--------------|
| Admin    | admin@rxecommerce.com      | admin123     |
| Customer | customer@rxecommerce.com   | customer123  |

### 3. Configure the backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rx_ecommerce
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Install dependencies and start the API:

```bash
npm install
npm run dev
```

The API runs at **http://localhost:5000**.

### 4. Start the customer website

```bash
cd customer
npm install
npm run dev
```

Open **http://localhost:3000**.

Optional: set `NUXT_PUBLIC_API_BASE=http://localhost:5000/api` in a `.env` file if needed.

### 5. Start the admin dashboard

```bash
cd admin
npm install
npm run dev
```

Open **http://localhost:5173** and sign in with the admin credentials above.

---

## Project Structure

```
RX-ecommerce/
├── server/          # Express API (port 5000)
├── customer/        # Nuxt.js storefront (port 3000)
├── admin/           # React admin panel (port 5173)
├── database/        # MySQL schema and seed data
│   ├── ecommerce.sql
│   └── seed.sql
└── README.md
```

---

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Customer registration |
| `POST /api/auth/login` | Login (returns JWT) |
| `GET /api/products` | List products (search, filter, pagination) |
| `GET /api/categories` | List categories |
| `GET /api/cart` | Get user cart (auth required) |
| `POST /api/orders` | Place order (auth required) |
| `GET /api/admin/dashboard/summary` | Dashboard stats (admin) |
| `GET /api/admin/orders` | All orders (admin) |
| `GET /api/admin/customers` | All customers (admin) |

---

## Creating a ZIP for Submission

From the project root:

**Windows (PowerShell):**
```powershell
Compress-Archive -Path * -DestinationPath RX-ecommerce.zip -Force
```

**macOS / Linux:**
```bash
zip -r RX-ecommerce.zip . -x "*/node_modules/*" -x "*/.git/*"
```

Exclude `node_modules` and `.env` files before submitting.

---

## Running All Services

Open three terminals:

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Customer site
cd customer && npm run dev

# Terminal 3 — Admin dashboard
cd admin && npm run dev
```

---

## License

MIT
