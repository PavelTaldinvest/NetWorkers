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
  const secret = process.env.JWT_SECRET || '';

  if (INSECURE_SECRETS.includes(secret) || secret.length < 32) {
    console.error(
      '❌ FATAL: JWT_SECRET не задан или слишком слабый (нужно >= 32 символов).\n' +
      '   Сгенерируйте надёжный секрет и добавьте его в .env, например:\n' +
      '   node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
      '   Запуск с секретом по умолчанию небезопасен — токены можно подделать.'
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
      password: process.env.DB_PASSWORD || '',
    },
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

module.exports = loadConfig();
