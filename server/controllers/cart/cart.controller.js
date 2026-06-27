/* eslint-env node */
/* global require, module */

const cartService = require('../../services/cart.service');
const { successResponse } = require('../../utils/response');

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.id);
    return successResponse(res, 200, 'Cart fetched successfully', cart);
  } catch (error) {
    return next(error);
  }
}

async function addItem(req, res, next) {
  try {
    const cart = await cartService.addItem(req.user.id, req.body);
    return successResponse(res, 200, 'Item added to cart', cart);
  } catch (error) {
    return next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const cart = await cartService.updateItem(req.user.id, req.params.itemId, req.body);
    return successResponse(res, 200, 'Cart updated', cart);
  } catch (error) {
    return next(error);
  }
}

async function removeItem(req, res, next) {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.itemId);
    return successResponse(res, 200, 'Item removed from cart', cart);
  } catch (error) {
    return next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    const cart = await cartService.clearCart(req.user.id);
    return successResponse(res, 200, 'Cart cleared', cart);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
