/* eslint-env node */
/* global require, module */

const { validationResult } = require('express-validator');
const categoryService = require('../../services/category.service');
const { successResponse } = require('../../utils/response');

async function listCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    return successResponse(res, 200, 'Categories fetched successfully', categories);
  } catch (error) {
    return next(error);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return successResponse(res, 200, 'Category fetched successfully', category);
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors.array().map((item) => item.msg);
      throw error;
    }

    const category = await categoryService.createCategory(req.body);
    return successResponse(res, 201, 'Category created successfully', category);
  } catch (error) {
    return next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors.array().map((item) => item.msg);
      throw error;
    }

    const category = await categoryService.updateCategory(req.params.id, req.body);
    return successResponse(res, 200, 'Category updated successfully', category);
  } catch (error) {
    return next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    return successResponse(res, 200, 'Category deleted successfully', null);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
