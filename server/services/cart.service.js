/* eslint-env node */
/* global require, module */

const cartModel = require('../models/commerce/cart.model');
const productModel = require('../models/product.model');

async function getCart(userId) {
  return cartModel.getCart(userId);
}

async function addItem(userId, payload) {
  if (!payload.productId || Number(payload.productId) <= 0) {
    const error = new Error('productId is required');
    error.statusCode = 400;
    throw error;
  }

  const product = await productModel.findById(payload.productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const quantity = Number(payload.quantity || 1);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    const error = new Error('quantity must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  return cartModel.addItem(userId, Number(payload.productId), quantity);
}

async function updateItem(userId, itemId, payload) {
  const quantity = Number(payload.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    const error = new Error('quantity must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  return cartModel.updateItem(userId, itemId, quantity);
}

async function removeItem(userId, itemId) {
  return cartModel.removeItem(userId, itemId);
}

async function clearCart(userId) {
  return cartModel.clearCart(userId);
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
