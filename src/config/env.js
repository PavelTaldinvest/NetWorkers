// Централизованная загрузка и валидация переменных окружения.
//
// Политика секретов (пункт №1 рекомендаций по безопасности):
//  - JWT_SECRET ОБЯЗАТЕЛЕН: значения по умолчанию в коде запрещены,
//    иначе любой, кто видит репозиторий, может подделать токен администратора.
//  - В тестовой среде (NODE_ENV=test) допускается детерминированный
//    тестовый секрет — он не используется нигде, кроме Jest.

const crypto = require('crypto');

// .env загружается ОДИН раз при первом require модуля. dotenv по умолчанию НЕ
// перезаписывает уже существующие переменные process.env — это даёт тестам
// (tests/setup.js) и оператору возможность переопределить значения из файла.
require('dotenv').config();

// Пустые строки в .env (например, «DB_PASSWORD=») dotenv возвращает как '' —
// нормализуем их к undefined, чтобы дальше сравнивать с «переменная не задана».
const nonEmpty = (v) => {
  const s = v === undefined || v === null ? '' : String(v).trim();
  return s === '' ? undefined : s;
};

const INSECURE_SECRETS = [
  'change-me',
  'change-me-to-a-long-random-string',
  'default-secret',
  'secret',
  'changeme',
];

// Только для NODE_ENV=test. Не является «секретом» вне тестов.
const TEST_JWT_SECRET = 'test-secret-for-jest-only-0123456789abcdef0123456789abcdef';

function fail(message) {
  console.error(message);
  process.exit(1);
}

function loadConfig() {
  const isTest = process.env.NODE_ENV === 'test';
  const rawSecret = nonEmpty(process.env.JWT_SECRET);

  let secret;
  if (!rawSecret) {
    if (!isTest) {
      fail(
        '❌ FATAL: JWT_SECRET не задан в .env.\n' +
        '   Значения по умолчанию в коде запрещены — с ними токены можно подделать.\n' +
        '   Сгенерируйте надёжный секрет и добавьте его в .env:\n' +
        `   JWT_SECRET=${crypto.randomBytes(48).toString('hex')}\n` +
        '   Повторный запуск без JWT_SECRET приведёт к остановке сервера.'
      );
    }
    secret = TEST_JWT_SECRET; // только Jest
  } else {
    secret = rawSecret;
  }

  if (INSECURE_SECRETS.includes(secret) || secret.length < 32) {
    fail(
      '❌ FATAL: JWT_SECRET слишком слабый (нужно >= 32 случайных символов)\n' +
      '   или совпадает с известным значением-заглушкой.\n' +
      '   Сгенерируйте новый: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }

  // Пароль БД обязателен: pg передаёт password в SASL-аутентификацию и
  // падает с "client password must be a string", если значение — undefined.
  const dbPassword = nonEmpty(process.env.DB_PASSWORD);
  if (dbPassword === undefined) {
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
