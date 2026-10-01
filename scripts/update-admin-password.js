// Скрипт обновления хеша пароля администратора в рабочей БД.
// Использование: DB_PASSWORD=... node scripts/update-admin-password.js "НовыйПароль"
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'egypt_estate',
  user: process.env.DB_USER || 'egypt_user',
  password: process.env.DB_PASSWORD || '',
});

(async () => {
  const pwd = process.argv[2];
  if (!pwd) { console.error('Usage: node update-admin-password.js <new-password>'); process.exit(1); }
  const hash = await bcrypt.hash(pwd, 10);
  const res = await pool.query(
    "UPDATE users SET password_hash = $1 WHERE username = 'admin' RETURNING username",
    [hash]
  );
  console.log(res.rowCount ? 'Updated admin: ' + res.rows[0].username : 'Admin user not found');
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
