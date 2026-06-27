/* eslint-env node */
/* global module */

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    const error = new Error('Access denied');
    error.statusCode = 403;
    error.errors = ['Access denied'];
    return next(error);
  }

  return next();
}

module.exports = adminOnly;
