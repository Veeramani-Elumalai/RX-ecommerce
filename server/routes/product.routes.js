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

router.get('/', productController.listProducts);
router.get('/:id', [param('id').isInt().withMessage('Product id must be an integer')], productController.getProduct);
router.get('/slug/:slug', productController.getProductBySlug);

router.post(
  '/',
  authenticate,
  adminOnly,
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('name is required'),
    body('slug').notEmpty().withMessage('slug is required'),
    body('sku').notEmpty().withMessage('sku is required'),
    body('categoryId').isInt().withMessage('categoryId must be an integer'),
    body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
    body('stock').isInt({ min: 0 }).withMessage('stock must be zero or greater'),
  ],
  productController.createProduct,
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  upload.single('image'),
  [
    param('id').isInt().withMessage('Product id must be an integer'),
    body('name').notEmpty().withMessage('name is required'),
    body('slug').notEmpty().withMessage('slug is required'),
    body('sku').notEmpty().withMessage('sku is required'),
    body('categoryId').isInt().withMessage('categoryId must be an integer'),
    body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
    body('stock').isInt({ min: 0 }).withMessage('stock must be zero or greater'),
  ],
  productController.updateProduct,
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  [param('id').isInt().withMessage('Product id must be an integer')],
  productController.deleteProduct,
);

module.exports = router;
