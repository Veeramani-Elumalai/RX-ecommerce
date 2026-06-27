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
  return categoryModel.createCategory(payload);
}

async function updateCategory(id, payload) {
  const existingCategory = await categoryModel.findById(id);

  if (!existingCategory) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  return categoryModel.updateCategory(id, payload);
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
