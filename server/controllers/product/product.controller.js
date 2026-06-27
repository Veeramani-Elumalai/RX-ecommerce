/* eslint-env node */
/* global require, module */

const { validationResult } = require('express-validator');
const productService = require('../../services/product.service');
const { successResponse } = require('../../utils/response');

async function listProducts(req, res, next) {
  try {
    const products = await productService.getProducts({
      search: req.query.search,
      categoryId: req.query.category,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit,
    });
    return successResponse(res, 200, 'Products fetched successfully', products);
  } catch (error) {
    return next(error);
  }
}

async function getProduct(req, res, next) {
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

async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors.array().map((item) => item.msg);
      throw error;
    }

    const product = await productService.createProduct(req.body, req.file);
    return successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors.array().map((item) => item.msg);
      throw error;
    }

    const product = await productService.updateProduct(req.params.id, req.body, req.file);
    return successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    return successResponse(res, 200, 'Product deleted successfully', null);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
