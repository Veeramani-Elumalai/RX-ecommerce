/* eslint-env node */
/* global require, module */

const fs = require('fs');
const path = require('path');
const productModel = require('../models/product.model');

const uploadDir = path.resolve(__dirname, '../uploads/products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

async function createProduct(productData, file) {
  const name = typeof productData.name === 'string' ? productData.name.trim() : '';
  const slug = typeof productData.slug === 'string' ? productData.slug.trim() : '';
  const sku = typeof productData.sku === 'string' ? productData.sku.trim() : '';
  const description = typeof productData.description === 'string' ? productData.description.trim() : '';
  const imagePathInput = typeof productData.image === 'string' ? productData.image.trim() : '';
  const categoryId = Number(productData.categoryId);
  const price = Number(productData.price);
  const stock = productData.stock === undefined || productData.stock === null || productData.stock === '' ? 0 : Number(productData.stock);

  if (!name || name.length < 2) {
    const error = new Error('Product name must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!slug || slug.length < 2) {
    const error = new Error('Product slug must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!sku || sku.length < 2) {
    const error = new Error('Product SKU must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (description && description.length > 2000) {
    const error = new Error('Description must be at most 2000 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(price) || price <= 0) {
    const error = new Error('Price must be greater than 0');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    const error = new Error('Stock cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    const error = new Error('Category is required');
    error.statusCode = 400;
    throw error;
  }

  if (!await productModel.categoryExists(categoryId)) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  if (await productModel.existsBySlug(slug)) {
    const error = new Error('Product slug already exists');
    error.statusCode = 409;
    throw error;
  }

  if (await productModel.existsBySku(sku)) {
    const error = new Error('Product SKU already exists');
    error.statusCode = 409;
    throw error;
  }

  if (imagePathInput) {
    const imagePattern = /^(https?:\/\/|\/uploads\/)/i;
    if (!imagePattern.test(imagePathInput) || imagePathInput.length > 500) {
      const error = new Error('Image path must be a valid URL or upload path');
      error.statusCode = 400;
      throw error;
    }
  }

  let imagePath = imagePathInput || null;

  if (file) {
    const filename = `${Date.now()}-${file.originalname}`;
    const uploadPath = path.join(uploadDir, filename);
    fs.writeFileSync(uploadPath, file.buffer);
    imagePath = `/uploads/products/${filename}`;
  }

  return productModel.create({
    categoryId,
    name,
    slug,
    description: description || null,
    sku,
    price,
    stock,
    image: imagePath,
  });
}

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
};
