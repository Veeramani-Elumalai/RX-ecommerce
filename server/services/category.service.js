/* eslint-env node */
/* global require, module */

const categoryModel = require('../models/category.model');

async function getAllCategories() {
  return categoryModel.findAll();
}

async function getCategoryById(id) {
  const category = await categoryModel.findById(id);

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return category;
}

async function createCategory(payload) {
  if (!payload.name || payload.name.trim().length < 2) {
    const error = new Error('Category name must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.slug || payload.slug.trim().length < 2) {
    const error = new Error('Category slug must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  const existingCategory = await categoryModel.findByNameOrSlug(payload.name.trim(), payload.slug.trim());

  if (existingCategory) {
    const error = new Error('Category already exists');
    error.statusCode = 409;
    throw error;
  }

  return categoryModel.createCategory({
    ...payload,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
  });
}

async function updateCategory(id, payload) {
  const existingCategory = await categoryModel.findById(id);

  if (!existingCategory) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  if (!payload.name || payload.name.trim().length < 2) {
    const error = new Error('Category name must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!payload.slug || payload.slug.trim().length < 2) {
    const error = new Error('Category slug must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  const duplicateCategory = await categoryModel.findByNameOrSlug(payload.name.trim(), payload.slug.trim());

  if (duplicateCategory && duplicateCategory.id !== Number(id)) {
    const error = new Error('Category already exists');
    error.statusCode = 409;
    throw error;
  }

  return categoryModel.updateCategory(id, {
    ...payload,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
  });
}

async function deleteCategory(id) {
  const existingCategory = await categoryModel.findById(id);

  if (!existingCategory) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  await categoryModel.deleteCategory(id);
  return true;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
