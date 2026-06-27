/* eslint-env node */
/* global module */

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const errorResponse = {
    success: false,
    message,
    errors: [],
  };

  if (err.name === 'ValidationError') {
    errorResponse.message = 'Validation failed';
    errorResponse.errors = Object.values(err.errors || {}).map((validationError) => validationError.message);
    return res.status(400).json(errorResponse);
  }

  if (err.code && err.code.startsWith('ER')) {
    errorResponse.message = 'Database error';
    errorResponse.errors = [err.message];
    return res.status(500).json(errorResponse);
  }

  if (statusCode >= 400 && statusCode < 500) {
    errorResponse.errors = err.errors || [message];
    return res.status(statusCode).json(errorResponse);
  }

  errorResponse.errors = ['Unexpected error occurred'];
  return res.status(statusCode).json(errorResponse);
}

module.exports = errorMiddleware;
