/* eslint-env node */
/* global require, module */

const productModel = require('../models/product.model');

async function getProducts() {
  return productModel.findAll();
}

async function getProductById(id) {
  const product = await productModel.findById(id);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
}

async function getProductBySlug(slug) {
  const product = await productModel.findBySlug(slug);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  return product;
}

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
};
