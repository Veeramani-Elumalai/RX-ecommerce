const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const authService = require('../services/auth.service');
const userModel = require('../models/user.model');
const authenticate = require('../middleware/auth/auth.middleware');
const errorMiddleware = require('../middleware/error.middleware');

test('registerUser rejects a duplicate email with conflict', async () => {
  mock.method(userModel, 'findByEmail', async () => ({ id: 1, email: 'veera@example.com' }));

  await assert.rejects(
    () => authService.registerUser({ email: 'veera@example.com', password: 'Password@123' }),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /already/i);
      return true;
    },
  );
});

test('authenticate middleware rejects missing token', () => {
  const req = { headers: {} };
  const res = {};
  let nextCalledWith = null;

  authenticate(req, res, (error) => {
    nextCalledWith = error;
  });

  assert.ok(nextCalledWith);
  assert.equal(nextCalledWith.statusCode, 401);
});

test('error middleware returns a normalized error payload', () => {
  const err = new Error('Validation failed');
  err.statusCode = 400;
  err.errors = ['firstName is required'];

  const req = {};
  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  errorMiddleware(err, req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    success: false,
    message: 'Validation failed',
    errors: ['firstName is required'],
  });
});
