/* eslint-env node */
/* global require, module */

const express = require('express');
const cartController = require('../controllers/cart/cart.controller');
const authenticate = require('../middleware/auth/auth.middleware');

const router = express.Router();

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, cartController.addItem);
router.put('/items/:itemId', authenticate, cartController.updateItem);
router.delete('/items/:itemId', authenticate, cartController.removeItem);
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
