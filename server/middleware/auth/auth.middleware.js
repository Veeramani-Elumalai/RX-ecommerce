/* eslint-env node */
/* global require, module */

const jwt = require('jsonwebtoken');
const config = require('../../config/env');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Authentication token is required');
    error.statusCode = 401;
    error.errors = ['Authentication token is required'];
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    return next();
  } catch (error) {
    const authError = new Error('Invalid or expired token');
    authError.statusCode = 401;
    authError.errors = ['Invalid or expired token'];
    return next(authError);
  }
}

module.exports = authenticate;
