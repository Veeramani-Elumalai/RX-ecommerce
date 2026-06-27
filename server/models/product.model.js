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

async function findAll() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT id, category_id, name, slug, description, sku, price, stock, image, is_active, created_at, updated_at FROM products WHERE is_active = 1 ORDER BY created_at DESC',
    );
    return rows;
  } finally {
    await connection.end();
  }
}

async function findById(id) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT id, category_id, name, slug, description, sku, price, stock, image, is_active, created_at, updated_at FROM products WHERE id = ? AND is_active = 1',
      [id],
    );
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function findBySlug(slug) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT id, category_id, name, slug, description, sku, price, stock, image, is_active, created_at, updated_at FROM products WHERE slug = ? AND is_active = 1',
      [slug],
    );
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function existsBySku(sku) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT id FROM products WHERE sku = ? LIMIT 1', [sku]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function existsBySlug(slug) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT id FROM products WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function categoryExists(categoryId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function create(product) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO products (category_id, name, slug, description, sku, price, stock, image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [product.categoryId, product.name, product.slug, product.description || null, product.sku, product.price, product.stock, product.image || null, product.isActive ?? true],
    );

    return {
      id: result.insertId,
      ...product,
      isActive: product.isActive ?? true,
    };
  } finally {
    await connection.end();
  }
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  existsBySku,
  existsBySlug,
  categoryExists,
  create,
};
