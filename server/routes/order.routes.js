/* eslint-env node */
/* global require, module */

const express = require('express');
const orderController = require('../controllers/orders/order.controller');
const authenticate = require('../middleware/auth/auth.middleware');

const router = express.Router();

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.listOrders);
router.get('/:id', authenticate, orderController.getOrder);

module.exports = router;
