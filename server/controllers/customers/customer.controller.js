/* eslint-env node */
/* global require, module */

const customerService = require('../../services/customer.service');
const { successResponse } = require('../../utils/response');

async function listCustomers(req, res, next) {
  try {
    const customers = await customerService.getCustomers(req.query);
    return successResponse(res, 200, 'Customers fetched successfully', customers);
  } catch (error) {
    return next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return successResponse(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCustomers,
  updateCustomer,
};
