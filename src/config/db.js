const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.DB.host,
  port: config.DB.port,
  database: config.DB.database,
  user: config.DB.user,
  password: config.DB.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Ошибки фоновых/idle-клиентов НЕ должны убивать весь процесс.
// Логариуем; при следующем запросе пул создаст новое соединение.
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
});

module.exports = pool;
