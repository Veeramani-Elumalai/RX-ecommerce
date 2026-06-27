/* eslint-env node */
/* global require, module */

const mysql = require('mysql2/promise');
const dbConfig = require('../../config/database');

async function getConnection() {
  return mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });
}

async function createOrder(userId, payload) {
  const connection = await getConnection();
  try {
    const [cartRows] = await connection.execute(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
       WHERE c.user_id = ?`,
      [userId],
    );

    if (!cartRows.length) {
      const error = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    const totalAmount = cartRows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const [result] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, status, payment_status, shipping_address) VALUES (?, ?, ?, ?, ?)',
      [userId, totalAmount, payload.status || 'pending', payload.paymentStatus || 'unpaid', JSON.stringify(payload.shippingAddress || {})],
    );

    const orderId = result.insertId;
    for (const item of cartRows) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, Number(item.price) * item.quantity],
      );
    }

    await connection.execute('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?)', [userId]);
    return { id: orderId, totalAmount, items: cartRows };
  } finally {
    await connection.end();
  }
}

async function findByUser(userId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT o.id, o.total_amount, o.status, o.payment_status, o.shipping_address, o.created_at
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId],
    );
    return rows;
  } finally {
    await connection.end();
  }
}

async function findById(id, userId = null) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT o.id, o.user_id, o.total_amount, o.status, o.payment_status, o.shipping_address, o.created_at,
              oi.product_id, oi.quantity, oi.unit_price, oi.subtotal, p.name, p.slug, p.image
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.id = ?${userId ? ' AND o.user_id = ?' : ''}`,
      userId ? [id, userId] : [id],
    );
    return rows;
  } finally {
    await connection.end();
  }
}

async function findRecent(limit = 5) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT o.id, o.total_amount, o.status, o.payment_status, o.created_at, u.first_name, u.last_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows;
  } finally {
    await connection.end();
  }
}

async function getDashboardMetrics() {
  const connection = await getConnection();
  try {
    const [[{ totalProducts }]] = await connection.execute('SELECT COUNT(*) AS totalProducts FROM products WHERE is_active = 1');
    const [[{ totalCategories }]] = await connection.execute('SELECT COUNT(*) AS totalCategories FROM categories');
    const [[{ totalOrders }]] = await connection.execute('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalSales }]] = await connection.execute('SELECT COALESCE(SUM(total_amount), 0) AS totalSales FROM orders');
    const [[{ lowStock }]] = await connection.execute('SELECT COUNT(*) AS lowStock FROM products WHERE is_active = 1 AND stock < 10');
    return { totalProducts, totalCategories, totalOrders, totalSales, lowStock };
  } finally {
    await connection.end();
  }
}

async function getLowStockProducts(limit = 5) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT id, name, stock FROM products WHERE is_active = 1 AND stock < 10 ORDER BY stock ASC LIMIT ?',
      [limit],
    );
    return rows;
  } finally {
    await connection.end();
  }
}

async function getTopSellingProducts(limit = 5) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT p.id, p.name, SUM(oi.quantity) AS totalSold
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       GROUP BY p.id, p.name
       ORDER BY totalSold DESC
       LIMIT ?`,
      [limit],
    );
    return rows;
  } finally {
    await connection.end();
  }
}

module.exports = {
  createOrder,
  findByUser,
  findById,
  findRecent,
  getDashboardMetrics,
  getLowStockProducts,
  getTopSellingProducts,
};
