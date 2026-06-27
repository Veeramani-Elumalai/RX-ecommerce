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

module.exports = {
  findAll,
  findById,
  findBySlug,
};
