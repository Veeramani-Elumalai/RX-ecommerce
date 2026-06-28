/* eslint-env node */
/* global require, module */

const userModel = require('../models/user.model');

async function getCustomers(query) {
  return userModel.findAllCustomers(query);
}

async function updateCustomer(id, payload) {
  if (payload.isActive === undefined) {
    const error = new Error('isActive is required');
    error.statusCode = 400;
    throw error;
  }

  return userModel.updateCustomerStatus(id, payload.isActive);
}

module.exports = {
  getCustomers,
  updateCustomer,
};
