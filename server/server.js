/* eslint-env node */
/* global require, process, module */

const mysql = require('mysql2/promise');

const app = require('./app');
const config = require('./config/env');
const dbConfig = require('./config/database');

let server;

async function testDatabaseConnection() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  await connection.end();
}

async function startServer() {
  try {
    await testDatabaseConnection();
    console.log('Database connection successful');
  } catch (error) {
    console.warn('Database connection unavailable:', error.message);

    if (config.nodeEnv === 'production') {
      console.error('Stopping server because database connection is required in production.');
      process.exit(1);
      return;
    }
  }

  server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  shutdown('unhandledRejection');
});

startServer();

module.exports = {
  startServer,
  shutdown,
};
