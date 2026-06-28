/* eslint-env node */
/* global require, module, process, __dirname */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function requireEnv(key, options = {}) {
  const value = process.env[key];

  if (value === undefined || (!options.allowEmpty && value === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function toNumber(value, key) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }

  return parsed;
}

const port = toNumber(requireEnv('PORT'), 'PORT');
const db = {
  host: requireEnv('DB_HOST'),
  port: toNumber(requireEnv('DB_PORT'), 'DB_PORT'),
  name: requireEnv('DB_NAME'),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD', { allowEmpty: true }),
};
const jwt = {
  secret: requireEnv('JWT_SECRET'),
  expiresIn: requireEnv('JWT_EXPIRES_IN'),
};
const nodeEnv = requireEnv('NODE_ENV');

const config = {
  port,
  db,
  jwt,
  nodeEnv,
};

module.exports = config;
module.exports.default = config;
