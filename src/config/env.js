// Централизованная загрузка и валидация переменных окружения.
// Запуск сервера без установленного JWT_SECRET запрещён —
// это закрывает уязвимость с fallback-секретом 'default-secret'.

require('dotenv').config();

const INSECURE_SECRETS = [
  '',
  'change-me',
  'change-me-to-a-long-random-string',
  'default-secret',
  'secret',
  'changeme',
];

function loadConfig() {
  const secret = process.env.JWT_SECRET || 'e0ea76effb454d67152412236ae1de7c7a95033000f6ee384bc13c1d3aa27c66d775de7ba472e0a2ed4e11291313edfa';

  if (INSECURE_SECRETS.includes(secret) || secret.length < 32) {
    console.error(
      '❌ FATAL: JWT_SECRET не задан или слишком слабый (нужно >= 32 символов).\n' +
      '   Сгенерируйте надёжный секрет и добавьте его в .env, например:\n' +
      '   node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
      '   Запуск с секретом по умолчанию небезопасен — токены можно подделать.'
    );
    process.exit(1);
  }

  // Пароль БД обязателен: pg передаёт password в SASL-аутентификацию и
  // падает с "client password must be a string", если значение — undefined.
  const dbPassword = process.env.DB_PASSWORD;
  if (dbPassword === undefined || dbPassword === null || String(dbPassword).trim() === '') {
    console.error(
      '❌ FATAL: DB_PASSWORD не задан в .env.\n' +
      '   Откройте файл .env и укажите пароль пользователя PostgreSQL, например:\n' +
      '   DB_PASSWORD=ваш_пароль\n' +
      '   (проверьте, что нет пробелов вокруг "=" и что строка не закомментирована "#").'
    );
    process.exit(1);
  }

  return {
    JWT_SECRET: secret,
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    PORT: Number(process.env.PORT) || 3000,
    DB: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'egypt_estate',
      user: process.env.DB_USER || 'egypt_user',
      password: String(dbPassword),
    },
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

module.exports = loadConfig();
