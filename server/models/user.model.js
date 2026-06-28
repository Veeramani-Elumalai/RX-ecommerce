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

async function createUser(userData) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO users (first_name, last_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.passwordHash,
        userData.phone,
        userData.role || 'customer',
      ],
    );

    return {
      id: result.insertId,
      email: userData.email,
    };
  } finally {
    await connection.end();
  }
}

async function findByEmail(email) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function findById(id) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT id, first_name, last_name, email, phone, role, is_active, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

async function findAllCustomers({ page = 1, limit = 10, search = '' }) {
  const connection = await getConnection();
  try {
    const whereClauses = ["role = 'customer'"];
    const params = [];

    if (search) {
      whereClauses.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereClauses.join(' AND ');
    const offset = (Number(page) - 1) * Number(limit);

    const [countRows] = await connection.execute(`SELECT COUNT(*) AS total FROM users WHERE ${whereClause}`, params);
    const [rows] = await connection.execute(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.is_active, u.created_at,
              (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
       FROM users u
       WHERE ${whereClause}
       ORDER BY u.created_at DESC
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

async function updateCustomerStatus(id, isActive) {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      "UPDATE users SET is_active = ? WHERE id = ? AND role = 'customer'",
      [isActive ? 1 : 0, id],
    );

    if (result.affectedRows === 0) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    return findById(id);
  } finally {
    await connection.end();
  }
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findAllCustomers,
  updateCustomerStatus,
};
