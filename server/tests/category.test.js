const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const categoryService = require('../services/category.service');
const categoryModel = require('../models/category.model');

test('createCategory rejects duplicate category names with conflict', async () => {
  mock.method(categoryModel, 'findByNameOrSlug', async () => ({ id: 1, name: 'Electronics' }));

  await assert.rejects(
    () => categoryService.createCategory({ name: 'Electronics', slug: 'electronics' }),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /already exists/i);
      return true;
    },
  );
});

test('createCategory rejects duplicate slugs with conflict', async () => {
  mock.method(categoryModel, 'findByNameOrSlug', async () => ({ id: 2, slug: 'electronics' }));

  await assert.rejects(
    () => categoryService.createCategory({ name: 'Phones', slug: 'electronics' }),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /already exists/i);
      return true;
    },
  );
});

test('getCategoryById throws not found for missing category', async () => {
  mock.method(categoryModel, 'findById', async () => null);

  await assert.rejects(
    () => categoryService.getCategoryById(999),
    (error) => {
      assert.equal(error.statusCode, 404);
      assert.match(error.message, /not found/i);
      return true;
    },
  );
});
