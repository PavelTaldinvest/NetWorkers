// Диагностика входа администратора: проверяет подключение к БД и совпадение пароля с хешем.
// Использование: node scripts/verify-admin-login.js "ПАРОЛЬ"
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const password = process.argv[2];
if (!password) {
  console.error('Использование: node scripts/verify-admin-login.js "ПАРОЛЬ"');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'egypt_estate',
  user: process.env.DB_USER || 'egypt_user',
  password: process.env.DB_PASSWORD || '',
  connectionTimeoutMillis: 5000,
});

(async () => {
  try {
    const r = await pool.query("SELECT id, username, role, password_hash FROM users WHERE username = 'admin'");
    if (r.rows.length === 0) {
      console.log('❌ Пользователь admin НЕ найден в таблице users. Выполните: psql -U postgres -f schema.sql');
    } else {
      const u = r.rows[0];
      const ok = await bcrypt.compare(password, u.password_hash);
      console.log(`✅ Подключение к БД: OK (база ${process.env.DB_NAME || 'egypt_estate'})`);
      console.log(`   admin найден: id=${u.id}, роль=${u.role}`);
      console.log(`   Хеш в БД: ${u.password_hash.slice(0, 20)}...`);
      console.log(ok ? '🔑 ПАРОЛЬ ВЕРНЫЙ — вход должен работать' : '❌ Пароль НЕ совпадает с хешем в БД — нужно обновить password_hash');
    }
  } catch (e) {
    console.error('❌ Ошибка подключения к PostgreSQL:', e.message);
    console.error('   Проверьте: запущен ли PostgreSQL, верны ли DB_HOST/DB_NAME/DB_USER/DB_PASSWORD в .env');
  } finally {
    await pool.end();
  }
})();
