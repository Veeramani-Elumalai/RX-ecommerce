/* eslint-env node */
/* global require, module */

const orderModel = require('../models/commerce/order.model');

async function createOrder(userId, payload) {
  return orderModel.createOrder(userId, payload);
}

async function getOrders(userId) {
  return orderModel.findByUser(userId);
}

async function getOrderById(id, userId) {
  const order = await orderModel.findById(id, userId);
  if (!order || !order.length) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  return order;
}

async function getRecentOrders(limit = 5) {
  return orderModel.findRecent(limit);
}

async function getDashboardMetrics() {
  return orderModel.getDashboardMetrics();
}

async function getLowStockProducts(limit = 5) {
  return orderModel.getLowStockProducts(limit);
}

async function getTopSellingProducts(limit = 5) {
  return orderModel.getTopSellingProducts(limit);
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getRecentOrders,
  getDashboardMetrics,
  getLowStockProducts,
  getTopSellingProducts,
};
