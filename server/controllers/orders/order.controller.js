/* eslint-env node */
/* global require, module */

const orderService = require('../../services/order.service');
const { successResponse } = require('../../utils/response');

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    return successResponse(res, 201, 'Order placed successfully', order);
  } catch (error) {
    return next(error);
  }
}

async function listOrders(req, res, next) {
  try {
    const orders = await orderService.getOrders(req.user.id);
    return successResponse(res, 200, 'Orders fetched successfully', orders);
  } catch (error) {
    return next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    return successResponse(res, 200, 'Order fetched successfully', order);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
};
