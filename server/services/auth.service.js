/* eslint-env node */
/* global require, module */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const config = require('../config/env');

async function registerUser(payload) {
  const existingUser = await userModel.findByEmail(payload.email);

  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await userModel.createUser({
    ...payload,
    passwordHash,
  });

  return user;
}

async function loginUser(payload) {
  const user = await userModel.findByEmail(payload.email);

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(payload.password, user.password);

  if (!isValidPassword) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return {
    user: {
      id: user.id,
      firstName: user.first_name,
      role: user.role,
    },
    token,
  };
}

async function getCurrentUser(userId) {
  const user = await userModel.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    firstName: user.first_name,
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
