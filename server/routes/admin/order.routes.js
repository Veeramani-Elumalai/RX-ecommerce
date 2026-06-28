/* eslint-env node */
/* global require, module */

const express = require('express');
const adminOrderController = require('../../controllers/orders/admin-order.controller');
const authenticate = require('../../middleware/auth/auth.middleware');
const requireAdmin = require('../../middleware/auth/admin.middleware');

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get('/', adminOrderController.listAllOrders);
router.get('/:id', adminOrderController.getOrder);
router.patch('/:id', adminOrderController.updateOrder);

module.exports = router;
