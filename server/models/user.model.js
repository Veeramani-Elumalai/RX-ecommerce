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
    const [rows] = await connection.execute('SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

module.exports = {
  createUser,
  findByEmail,
  findById,
};
