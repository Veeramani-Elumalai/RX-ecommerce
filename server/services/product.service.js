/* eslint-env node */
/* global require, module */

const path = require('path');
const fs = require('fs');
const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');

const uploadDir = path.resolve(__dirname, '../uploads/products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function getProducts(query = {}) {
  return productModel.findAll(query);
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

async function createProduct(payload, file) {
  if (!payload.name || payload.name.trim().length < 2) {
    const error = new Error('Product name must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.slug || payload.slug.trim().length < 2) {
    const error = new Error('Product slug must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.sku || payload.sku.trim().length < 2) {
    const error = new Error('Product SKU must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.categoryId) {
    const error = new Error('Category is required');
    error.statusCode = 400;
    throw error;
  }

  const category = await categoryModel.findById(payload.categoryId);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const duplicate = await productModel.findBySlugOrSku(payload.slug.trim(), payload.sku.trim());
  if (duplicate) {
    const error = new Error('Product already exists');
    error.statusCode = 409;
    throw error;
  }

  if (!payload.stock && payload.stock !== 0) {
    const error = new Error('Stock is required');
    error.statusCode = 400;
    throw error;
  }

  if (Number(payload.stock) < 0) {
    const error = new Error('Stock cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  let imagePath = null;
  if (file) {
    const filename = `${Date.now()}-${file.originalname}`;
    const uploadPath = path.join(uploadDir, filename);
    fs.writeFileSync(uploadPath, file.buffer);
    imagePath = `/uploads/products/${filename}`;
  }

  return productModel.createProduct({
    ...payload,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    sku: payload.sku.trim(),
    price: Number(payload.price),
    stock: Number(payload.stock),
    categoryId: Number(payload.categoryId),
    image: imagePath,
  });
}

async function updateProduct(id, payload, file) {
  const existingProduct = await productModel.findById(id);
  if (!existingProduct) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (!payload.name || payload.name.trim().length < 2) {
    const error = new Error('Product name must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.slug || payload.slug.trim().length < 2) {
    const error = new Error('Product slug must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.sku || payload.sku.trim().length < 2) {
    const error = new Error('Product SKU must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.categoryId) {
    const error = new Error('Category is required');
    error.statusCode = 400;
    throw error;
  }

  const category = await categoryModel.findById(payload.categoryId);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const duplicate = await productModel.findBySlugOrSku(payload.slug.trim(), payload.sku.trim());
  if (duplicate && duplicate.id !== Number(id)) {
    const error = new Error('Product already exists');
    error.statusCode = 409;
    throw error;
  }

  if (Number(payload.stock) < 0) {
    const error = new Error('Stock cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  let imagePath = existingProduct.image;
  if (file) {
    const filename = `${Date.now()}-${file.originalname}`;
    const uploadPath = path.join(uploadDir, filename);
    fs.writeFileSync(uploadPath, file.buffer);
    imagePath = `/uploads/products/${filename}`;
  }

  return productModel.updateProduct(id, {
    ...payload,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    sku: payload.sku.trim(),
    price: Number(payload.price),
    stock: Number(payload.stock),
    categoryId: Number(payload.categoryId),
    image: imagePath,
  });
}

async function deleteProduct(id) {
  const existingProduct = await productModel.findById(id);
  if (!existingProduct) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  await productModel.deleteProduct(id);
  return true;
}

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
