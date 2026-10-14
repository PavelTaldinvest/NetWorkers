const rateLimit = require('express-rate-limit');

// Лимиты: limit — актуальное имя опции express-rate-limit v7+,
// max оставлен для обратной совместимости со старыми версиями.
const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

// Строгий лимит для авторизации (защита от брутфорса)
const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 минут
  limit: 5, // 5 попыток
  message: {
    success: false,
    error: { message: 'Слишком много попыток входа. Попробуйте позже.' }
  },
});

// Лимит для заявок (защита от спама)
const applicationLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000, // 1 час
  limit: 10, // 10 заявок в час с одного IP
  message: {
    success: false,
    error: { message: 'Слишком много заявок. Попробуйте позже.' }
  },
});

// Мягкий лимит для остального API
const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 минут
  limit: 100, // 100 запросов
  message: {
    success: false,
    error: { message: 'Слишком много запросов. Попробуйте позже.' }
  },
});

module.exports = { authLimiter, applicationLimiter, apiLimiter };
