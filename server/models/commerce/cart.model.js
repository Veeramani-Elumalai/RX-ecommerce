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

async function ensureCart(userId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [userId]);
    if (rows[0]) {
      return rows[0].id;
    }

    const [result] = await connection.execute('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return result.insertId;
  } finally {
    await connection.end();
  }
}

async function getCart(userId) {
  const connection = await getConnection();
  try {
    const cartId = await ensureCart(userId);
    const [rows] = await connection.execute(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.slug, p.price, p.image, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cartId],
    );

    return {
      id: cartId,
      items: rows,
    };
  } finally {
    await connection.end();
  }
}

async function addItem(userId, productId, quantity) {
  const connection = await getConnection();
  try {
    const cartId = await ensureCart(userId);
    const [existingRows] = await connection.execute('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1', [cartId, productId]);
    const existing = existingRows[0];

    if (existing) {
      await connection.execute('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await connection.execute('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, quantity]);
    }

    return getCart(userId);
  } finally {
    await connection.end();
  }
}

async function updateItem(userId, itemId, quantity) {
  const connection = await getConnection();
  try {
    await connection.execute('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = (SELECT id FROM carts WHERE user_id = ?)', [quantity, itemId, userId]);
    return getCart(userId);
  } finally {
    await connection.end();
  }
}

async function removeItem(userId, itemId) {
  const connection = await getConnection();
  try {
    await connection.execute('DELETE FROM cart_items WHERE id = ? AND cart_id = (SELECT id FROM carts WHERE user_id = ?)', [itemId, userId]);
    return getCart(userId);
  } finally {
    await connection.end();
  }
}

async function clearCart(userId) {
  const connection = await getConnection();
  try {
    await connection.execute('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?)', [userId]);
    return { id: null, items: [] };
  } finally {
    await connection.end();
  }
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
