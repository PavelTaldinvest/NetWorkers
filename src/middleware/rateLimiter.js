const rateLimit = require('express-rate-limit');

// Строгий лимит для авторизации (защита от брутфорса)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток
  message: {
    success: false,
    error: { message: 'Слишком много попыток входа. Попробуйте позже.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Лимит для заявок (защита от спама)
const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10, // 10 заявок в час с одного IP
  message: {
    success: false,
    error: { message: 'Слишком много заявок. Попробуйте позже.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Мягкий лимит для остального API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов
  message: {
    success: false,
    error: { message: 'Слишком много запросов. Попробуйте позже.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, applicationLimiter, apiLimiter };
