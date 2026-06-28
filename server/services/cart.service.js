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

  const cart = await cartModel.getCart(userId);
  const existing = cart.items.find((item) => Number(item.product_id) === Number(payload.productId));
  const nextQuantity = quantity + Number(existing?.quantity || 0);
  if (nextQuantity > Number(product.stock)) {
    const error = new Error(`Only ${product.stock} item(s) available for ${product.name}`);
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

  const cart = await cartModel.getCart(userId);
  const item = cart.items.find((entry) => Number(entry.id) === Number(itemId));

  if (!item) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  if (quantity > Number(item.stock)) {
    const error = new Error(`Only ${item.stock} item(s) available for ${item.name}`);
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
