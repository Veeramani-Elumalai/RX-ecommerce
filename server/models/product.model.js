/* eslint-env node */
/* global require, module */

const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

async function getConnection() {
  return mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });
}

async function findAll({ search = '', categoryId, sort = 'newest', page = 1, limit = 10 }) {
  const connection = await getConnection();
  try {
    const offset = (Number(page) - 1) * Number(limit);
    let query = 'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    const params = [];

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(Number(categoryId));
    }

    if (sort === 'price') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'name') {
      query += ' ORDER BY p.name ASC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    await connection.end();
  }
}

async function findById(id) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.is_active = 1', [id]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function findBySlug(slug) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1', [slug]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function findBySku(sku) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM products WHERE sku = ?', [sku]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function findBySlugOrSku(slug, sku) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM products WHERE slug = ? OR sku = ?', [slug, sku]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function createProduct(payload) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO products (category_id, name, slug, description, sku, price, stock, image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [payload.categoryId, payload.name, payload.slug, payload.description || null, payload.sku, payload.price, payload.stock || 0, payload.image || null, payload.isActive ?? true],
    );

    return {
      id: result.insertId,
      ...payload,
      isActive: payload.isActive ?? true,
    };
  } finally {
    await connection.end();
  }
}

async function updateProduct(id, payload) {
  const connection = await getConnection();
  try {
    await connection.execute(
      'UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, sku = ?, price = ?, stock = ?, image = ?, is_active = ? WHERE id = ?',
      [payload.categoryId, payload.name, payload.slug, payload.description || null, payload.sku, payload.price, payload.stock || 0, payload.image || null, payload.isActive ?? true, id],
    );

    return { id, ...payload, isActive: payload.isActive ?? true };
  } finally {
    await connection.end();
  }
}

async function deleteProduct(id) {
  const connection = await getConnection();
  try {
    await connection.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    return true;
  } finally {
    await connection.end();
  }
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  findBySku,
  findBySlugOrSku,
  createProduct,
  updateProduct,
  deleteProduct,
};
