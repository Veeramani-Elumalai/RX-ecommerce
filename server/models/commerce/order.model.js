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
    await connection.beginTransaction();

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

    for (const item of cartRows) {
      if (item.quantity > item.stock) {
        const error = new Error(`Insufficient stock for ${item.name}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const totalAmount = cartRows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const [result] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, status, payment_status, shipping_address) VALUES (?, ?, ?, ?, ?)',
      [userId, totalAmount, payload.status || 'pending', payload.paymentStatus || 'paid', JSON.stringify(payload.shippingAddress || {})],
    );

    const orderId = result.insertId;
    for (const item of cartRows) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, Number(item.price) * item.quantity],
      );
      await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await connection.execute('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?)', [userId]);
    await connection.commit();
    return { id: orderId, totalAmount, items: cartRows };
  } catch (error) {
    await connection.rollback();
    throw error;
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

async function findAllAdmin({ page = 1, limit = 10, status = '', search = '' }) {
  const connection = await getConnection();
  try {
    const whereClauses = ['1=1'];
    const params = [];

    if (status) {
      whereClauses.push('o.status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(o.id = ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
      const searchId = Number(search);
      params.push(Number.isNaN(searchId) ? 0 : searchId, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereClauses.join(' AND ');
    const offset = (Number(page) - 1) * Number(limit);

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) AS total FROM orders o JOIN users u ON u.id = o.user_id WHERE ${whereClause}`,
      params,
    );

    const [rows] = await connection.execute(
      `SELECT o.id, o.user_id, o.total_amount, o.status, o.payment_status, o.shipping_address, o.created_at,
              u.first_name, u.last_name, u.email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset],
    );

    return {
      items: rows,
      total: Number(countRows[0].total),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.max(1, Math.ceil(Number(countRows[0].total) / Number(limit))),
    };
  } finally {
    await connection.end();
  }
}

async function updateOrder(id, payload) {
  const connection = await getConnection();
  try {
    const updates = [];
    const params = [];

    if (payload.status) {
      updates.push('status = ?');
      params.push(payload.status);
    }

    if (payload.paymentStatus) {
      updates.push('payment_status = ?');
      params.push(payload.paymentStatus);
    }

    if (!updates.length) {
      const error = new Error('No valid fields to update');
      error.statusCode = 400;
      throw error;
    }

    params.push(id);
    const [result] = await connection.execute(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return findById(id);
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
    const [[{ totalSales }]] = await connection.execute("SELECT COALESCE(SUM(total_amount), 0) AS totalSales FROM orders WHERE status != 'cancelled'");
    const [[{ lowStock }]] = await connection.execute('SELECT COUNT(*) AS lowStock FROM products WHERE is_active = 1 AND stock < 10');
    const [[{ totalCustomers }]] = await connection.execute("SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'");
    return { totalProducts, totalCategories, totalOrders, totalSales, lowStock, totalCustomers };
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
  findAllAdmin,
  updateOrder,
  getDashboardMetrics,
  getLowStockProducts,
  getTopSellingProducts,
};
