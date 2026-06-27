/* eslint-env node */
/* global require, module */

const { validationResult } = require('express-validator');
const authService = require('../../services/auth.service');
const { successResponse } = require('../../utils/response');

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors.array().map((item) => item.msg);
      throw error;
    }

    const user = await authService.registerUser(req.body);
    return successResponse(res, 201, 'User registered successfully', user);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors.array().map((item) => item.msg);
      throw error;
    }

    const result = await authService.loginUser(req.body);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return successResponse(res, 200, undefined, user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
