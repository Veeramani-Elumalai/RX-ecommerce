/* eslint-env node */
/* global require, module */

const orderService = require('../../services/order.service');
const { successResponse } = require('../../utils/response');

async function getDashboardSummary(req, res, next) {
  try {
    const metrics = await orderService.getDashboardMetrics();
    const recentOrders = await orderService.getRecentOrders(5);
    const lowStockProducts = await orderService.getLowStockProducts(5);
    const topSellingProducts = await orderService.getTopSellingProducts(5);

    return successResponse(res, 200, 'Dashboard summary fetched successfully', {
      metrics,
      recentOrders,
      lowStockProducts,
      topSellingProducts,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboardSummary,
};
