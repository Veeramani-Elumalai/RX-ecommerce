/* eslint-env node */
/* global require, module */

const authService = require('../../services/auth.service');
const { successResponse } = require('../../utils/response');

async function getProfile(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return successResponse(res, 200, 'Profile fetched successfully', user);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
};
