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
    const [rows] = await connection.execute('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  } finally {
    await connection.end();
  }
}

async function findById(id) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function createCategory(payload) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO categories (name, slug, description, image, is_active) VALUES (?, ?, ?, ?, ?)',
      [payload.name, payload.slug, payload.description || null, payload.image || null, payload.isActive ?? true],
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

async function updateCategory(id, payload) {
  const connection = await getConnection();
  try {
    await connection.execute(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, is_active = ? WHERE id = ?',
      [payload.name, payload.slug, payload.description || null, payload.image || null, payload.isActive ?? true, id],
    );

    return { id, ...payload, isActive: payload.isActive ?? true };
  } finally {
    await connection.end();
  }
}

async function deleteCategory(id) {
  const connection = await getConnection();
  try {
    await connection.execute('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  } finally {
    await connection.end();
  }
}

module.exports = {
  findAll,
  findById,
  createCategory,
  updateCategory,
  deleteCategory,
};
