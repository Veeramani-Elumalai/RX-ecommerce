/* eslint-env node */
/* global require, module */

const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/category/category.controller');
const authenticate = require('../middleware/auth/auth.middleware');
const adminOnly = require('../middleware/auth/admin.middleware');

const router = express.Router();

router.get('/', categoryController.listCategories);
router.get('/:id', [param('id').isInt().withMessage('Category id must be an integer')], categoryController.getCategory);

router.post(
  '/',
  authenticate,
  adminOnly,
  [
    body('name').notEmpty().withMessage('name is required'),
    body('slug').notEmpty().withMessage('slug is required'),
  ],
  categoryController.createCategory,
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  [
    param('id').isInt().withMessage('Category id must be an integer'),
    body('name').notEmpty().withMessage('name is required'),
    body('slug').notEmpty().withMessage('slug is required'),
  ],
  categoryController.updateCategory,
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  [param('id').isInt().withMessage('Category id must be an integer')],
  categoryController.deleteCategory,
);

module.exports = router;
