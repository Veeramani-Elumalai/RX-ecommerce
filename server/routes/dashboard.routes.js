/* eslint-env node */
/* global require, module */

const express = require('express');
const dashboardController = require('../controllers/dashboard/dashboard.controller');
const authenticate = require('../middleware/auth/auth.middleware');
const adminOnly = require('../middleware/auth/admin.middleware');

const router = express.Router();

router.get('/summary', authenticate, adminOnly, dashboardController.getDashboardSummary);

module.exports = router;
