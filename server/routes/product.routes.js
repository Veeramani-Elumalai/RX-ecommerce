/* eslint-env node */
/* global require, module */

const express = require('express');
const { param } = require('express-validator');
const productController = require('../controllers/product/product.controller');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', [param('id').isInt().withMessage('Product id must be an integer')], productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);

module.exports = router;
