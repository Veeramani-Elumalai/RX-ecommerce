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
      'SELECT p.id, p.category_id, p.name, p.slug, p.description, p.sku, p.price, p.stock, p.image, p.is_active, p.created_at, p.updated_at, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 ORDER BY p.created_at DESC',
    );
    return rows;
  } finally {
    await connection.end();
  }
}

async function findAllWithFilters({ page = 1, limit = 10, search = '', categoryId = null, sortBy = 'created_at', sortOrder = 'desc' }) {
  const connection = await getConnection();
  try {
    const whereClauses = ['p.is_active = 1'];
    const params = [];

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      whereClauses.push('p.category_id = ?');
      params.push(categoryId);
    }

    const whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
    const allowedSortColumns = {
      name: 'p.name',
      price: 'p.price',
      created_at: 'p.created_at',
    };
    const sortColumn = allowedSortColumns[sortBy] || 'p.created_at';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (Number(page) - 1) * Number(limit);

    const [countRows] = await connection.execute(`SELECT COUNT(*) AS total FROM products p${whereClause}`, params);
    const [rows] = await connection.execute(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.sku, p.price, p.stock, p.image, p.is_active, p.created_at, p.updated_at, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id${whereClause} ORDER BY ${sortColumn} ${direction} LIMIT ? OFFSET ?`,
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

async function findById(id, includeInactive = false) {
  const connection = await getConnection();
  try {
    const activeCondition = includeInactive ? '' : ' AND p.is_active = 1';
    const [rows] = await connection.execute(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.sku, p.price, p.stock, p.image, p.is_active, p.created_at, p.updated_at, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?${activeCondition}`,
      [id],
    );
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function findBySlug(slug, includeInactive = false) {
  const connection = await getConnection();
  try {
    const activeCondition = includeInactive ? '' : ' AND p.is_active = 1';
    const [rows] = await connection.execute(
      `SELECT p.id, p.category_id, p.name, p.slug, p.description, p.sku, p.price, p.stock, p.image, p.is_active, p.created_at, p.updated_at, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?${activeCondition}`,
      [slug],
    );
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function existsBySku(sku, excludeId = null) {
  const connection = await getConnection();
  try {
    if (excludeId) {
      const [rows] = await connection.execute('SELECT id FROM products WHERE sku = ? AND id != ? LIMIT 1', [sku, excludeId]);
      return rows[0] || null;
    }

    const [rows] = await connection.execute('SELECT id FROM products WHERE sku = ? LIMIT 1', [sku]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function existsBySlug(slug, excludeId = null) {
  const connection = await getConnection();
  try {
    if (excludeId) {
      const [rows] = await connection.execute('SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1', [slug, excludeId]);
      return rows[0] || null;
    }

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

async function update(id, product) {
  const connection = await getConnection();
  try {
    await connection.execute(
      'UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, sku = ?, price = ?, stock = ?, image = ?, is_active = ? WHERE id = ?',
      [product.categoryId, product.name, product.slug, product.description || null, product.sku, product.price, product.stock, product.image || null, product.isActive ?? true, id],
    );

    return {
      id,
      ...product,
      isActive: product.isActive ?? true,
    };
  } finally {
    await connection.end();
  }
}

async function deleteById(id) {
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
  findAllWithFilters,
  findById,
  findBySlug,
  existsBySku,
  existsBySlug,
  categoryExists,
  create,
  update,
  deleteById,
};
