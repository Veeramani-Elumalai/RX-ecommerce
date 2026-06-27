/* eslint-env node */
/* global require, module */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth/auth.controller');
const authenticate = require('../middleware/auth/auth.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('firstName is required'),
    body('lastName').notEmpty().withMessage('lastName is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('phone').notEmpty().withMessage('phone is required'),
  ],
  authController.register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login,
);

router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
