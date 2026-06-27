/* eslint-env node */
/* global require, module */

const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const productController = require('../controllers/product/product.controller');
const authenticate = require('../middleware/auth/auth.middleware');
const adminOnly = require('../middleware/auth/admin.middleware');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', [param('id').isInt().withMessage('Product id must be an integer')], productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);

router.post(
  '/',
  authenticate,
  adminOnly,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ min: 2, max: 250 }).withMessage('name must be between 2 and 250 characters'),
    body('slug').trim().notEmpty().withMessage('slug is required').isLength({ min: 2, max: 270 }).withMessage('slug must be between 2 and 270 characters'),
    body('sku').trim().notEmpty().withMessage('sku is required').isLength({ min: 2, max: 100 }).withMessage('sku must be between 2 and 100 characters'),
    body('categoryId').isInt({ min: 1 }).withMessage('categoryId must be a positive integer'),
    body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
    body('stock').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('stock must be zero or greater'),
    body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }).withMessage('description must be at most 2000 characters'),
    body('image').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('image must be at most 500 characters'),
  ],
  productController.createProduct,
);

module.exports = router;
