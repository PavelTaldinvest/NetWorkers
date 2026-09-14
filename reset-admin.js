require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetAdmin() {
  try {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await pool.query(
      `INSERT INTO users (username, password_hash, role) 
       VALUES ('admin', $1, 'admin') 
       ON CONFLICT (username) 
       DO UPDATE SET password_hash = $1, role = 'admin'`,
      [hash]
    );
    console.log('✅ Пароль админа успешно сброшен на: admin123');
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  } finally {
    await pool.end();
  }
}

resetAdmin();