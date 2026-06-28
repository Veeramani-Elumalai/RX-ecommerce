/* eslint-env node */
/* global require, module */

const orderService = require('../../services/order.service');
const { successResponse } = require('../../utils/response');

async function listAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders(req.query);
    return successResponse(res, 200, 'Orders fetched successfully', orders);
  } catch (error) {
    return next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await orderService.getAdminOrderById(req.params.id);
    return successResponse(res, 200, 'Order fetched successfully', order);
  } catch (error) {
    return next(error);
  }
}

async function updateOrder(req, res, next) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body);
    return successResponse(res, 200, 'Order updated successfully', order);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listAllOrders,
  getOrder,
  updateOrder,
};
