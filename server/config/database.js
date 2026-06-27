/* eslint-env node */
/* global require, module */

const config = require('./env');

module.exports = {
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  dialect: 'mysql',
};
