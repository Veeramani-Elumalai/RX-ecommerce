/* eslint-env node */
/* global require, module */

const path = require('path');
const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const productController = require('../controllers/product/product.controller');
const authenticate = require('../middleware/auth/auth.middleware');
const adminOnly = require('../middleware/auth/admin.middleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    const error = new Error('Only JPG, JPEG, PNG, and WEBP images are allowed');
    error.code = 'INVALID_FILE_TYPE';
    cb(error);
  },
});

function handleUpload(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (error) {
      const uploadError = new Error('Image upload failed');
      uploadError.statusCode = 400;
      uploadError.errors = [];

      if (error.code === 'LIMIT_FILE_SIZE') {
        uploadError.message = 'Image must be 5MB or smaller';
        uploadError.errors = [uploadError.message];
      } else if (error.code === 'INVALID_FILE_TYPE') {
        uploadError.message = 'Only JPG, JPEG, PNG, and WEBP images are allowed';
        uploadError.errors = [uploadError.message];
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        uploadError.message = 'Only one image file is allowed';
        uploadError.errors = [uploadError.message];
      }

      return next(uploadError);
    }

    return next();
  });
}

const productValidationRules = [
  body('name').trim().notEmpty().withMessage('name is required').isLength({ min: 2, max: 250 }).withMessage('name must be between 2 and 250 characters'),
  body('slug').trim().notEmpty().withMessage('slug is required').isLength({ min: 2, max: 270 }).withMessage('slug must be between 2 and 270 characters'),
  body('sku').trim().notEmpty().withMessage('sku is required').isLength({ min: 2, max: 100 }).withMessage('sku must be between 2 and 100 characters'),
  body('categoryId').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('categoryId must be a positive integer'),
  body('category_id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('category_id must be a positive integer'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('stock').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('stock must be zero or greater'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }).withMessage('description must be at most 2000 characters'),
  body('image').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('image must be at most 500 characters'),
];

router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

router.get('/', productController.getProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', [param('id').isInt().withMessage('Product id must be an integer')], productController.getProductById);

router.post('/', authenticate, adminOnly, handleUpload, productValidationRules, productController.createProduct);
router.put('/:id', authenticate, adminOnly, handleUpload, [param('id').isInt().withMessage('Product id must be an integer')], productValidationRules, productController.updateProduct);
router.delete('/:id', authenticate, adminOnly, [param('id').isInt().withMessage('Product id must be an integer')], productController.deleteProduct);

module.exports = router;
