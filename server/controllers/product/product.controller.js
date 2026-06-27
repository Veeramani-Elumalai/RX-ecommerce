/* eslint-env node */
/* global require, module */

const productService = require('../../services/product.service');
const { successResponse } = require('../../utils/response');

async function getProducts(req, res, next) {
  try {
    const products = await productService.getProducts();
    return successResponse(res, 200, 'Products fetched successfully', products);
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, 200, 'Product fetched successfully', product);
  } catch (error) {
    return next(error);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return successResponse(res, 200, 'Product fetched successfully', product);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
};
