/* eslint-env node */
/* global require, module */

const express = require('express');
const customerController = require('../../controllers/customers/customer.controller');
const authenticate = require('../../middleware/auth/auth.middleware');
const requireAdmin = require('../../middleware/auth/admin.middleware');

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get('/', customerController.listCustomers);
router.patch('/:id', customerController.updateCustomer);

module.exports = router;
