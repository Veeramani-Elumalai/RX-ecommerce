/* eslint-env node */
/* global require, module */

const express = require('express');
const profileController = require('../controllers/profile/profile.controller');
const authenticate = require('../middleware/auth/auth.middleware');

const router = express.Router();

router.get('/', authenticate, profileController.getProfile);

module.exports = router;
