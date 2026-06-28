/* eslint-env node */
/* global require, module */

const fs = require('fs');
const path = require('path');
const productModel = require('../models/product.model');

const uploadDir = path.resolve(__dirname, '../uploads/products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveInteger(value, defaultValue) {
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return defaultValue;
  }

  return parsedValue;
}

function createNotFoundError(message = 'Product not found') {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function buildProductPayload(productData) {
  const name = normalizeString(productData.name);
  const slug = normalizeString(productData.slug);
  const sku = normalizeString(productData.sku);
  const description = normalizeString(productData.description);
  const image = productData.image === undefined ? undefined : normalizeString(productData.image);
  const categoryId = Number(productData.categoryId ?? productData.category_id);
  const price = Number(productData.price);
  const stock = productData.stock === undefined || productData.stock === null || productData.stock === '' ? 0 : Number(productData.stock);

  if (!name || name.length < 2) {
    throw createValidationError('Product name must be at least 2 characters long');
  }

  if (!slug || slug.length < 2) {
    throw createValidationError('Product slug must be at least 2 characters long');
  }

  if (!sku || sku.length < 2) {
    throw createValidationError('Product SKU must be at least 2 characters long');
  }

  if (description && description.length > 2000) {
    throw createValidationError('Description must be at most 2000 characters long');
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw createValidationError('Price must be greater than 0');
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw createValidationError('Stock cannot be negative');
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw createValidationError('Category is required');
  }

  if (image !== undefined && image !== '' && image.length > 500) {
    throw createValidationError('Image path must be at most 500 characters long');
  }

  return {
    name,
    slug,
    sku,
    description: description || null,
    image: image === undefined ? undefined : (image || null),
    categoryId,
    price,
    stock,
  };
}

async function resolveImagePath(file, imageInput, existingImage) {
  if (file) {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const uploadPath = path.join(uploadDir, filename);
    fs.writeFileSync(uploadPath, file.buffer);
    return `/uploads/products/${filename}`;
  }

  if (imageInput === undefined) {
    return existingImage || null;
  }

  return imageInput || null;
}

async function getProducts(query = {}) {
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 10);
  const search = normalizeString(query.search);
  const category = Number(query.categoryId ?? query.category);
  const categoryId = Number.isInteger(category) && category > 0 ? category : null;
  const sortBy = ['name', 'price', 'created_at'].includes(query.sortBy) ? query.sortBy : 'created_at';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return productModel.findAllWithFilters({ page, limit, search, categoryId, sortBy, sortOrder });
}

async function getProductById(id) {
  const product = await productModel.findById(id);

  if (!product) {
    throw createNotFoundError();
  }

  return product;
}

async function getProductBySlug(slug) {
  const product = await productModel.findBySlug(slug);

  if (!product) {
    throw createNotFoundError();
  }

  return product;
}

async function createProduct(productData, file) {
  const payload = buildProductPayload(productData);

  if (!await productModel.categoryExists(payload.categoryId)) {
    throw createNotFoundError('Category not found');
  }

  if (await productModel.existsBySlug(payload.slug)) {
    const error = new Error('Product slug already exists');
    error.statusCode = 409;
    throw error;
  }

  if (await productModel.existsBySku(payload.sku)) {
    const error = new Error('Product SKU already exists');
    error.statusCode = 409;
    throw error;
  }

  const imagePath = await resolveImagePath(file, payload.image, null);

  return productModel.create({
    categoryId: payload.categoryId,
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    sku: payload.sku,
    price: payload.price,
    stock: payload.stock,
    image: imagePath,
  });
}

async function updateProduct(id, productData, file) {
  const existingProduct = await productModel.findById(id, true);

  if (!existingProduct) {
    throw createNotFoundError();
  }

  const payload = buildProductPayload(productData);

  if (!await productModel.categoryExists(payload.categoryId)) {
    throw createNotFoundError('Category not found');
  }

  if (await productModel.existsBySlug(payload.slug, id)) {
    const error = new Error('Product slug already exists');
    error.statusCode = 409;
    throw error;
  }

  if (await productModel.existsBySku(payload.sku, id)) {
    const error = new Error('Product SKU already exists');
    error.statusCode = 409;
    throw error;
  }

  const imagePath = await resolveImagePath(file, payload.image, existingProduct.image);

  return productModel.update(id, {
    categoryId: payload.categoryId,
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    sku: payload.sku,
    price: payload.price,
    stock: payload.stock,
    image: imagePath,
  });
}

async function deleteProduct(id) {
  const existingProduct = await productModel.findById(id, true);

  if (!existingProduct) {
    throw createNotFoundError();
  }

  return productModel.deleteById(id);
}

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
