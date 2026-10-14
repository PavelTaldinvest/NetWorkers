const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { updateCurrencyRates } = require('../services/currencyUpdater');
const { CURRENCY_CODES } = require('../utils/currency');

const router = express.Router();

// Конвенция: rate = сколько EGP стоит 1 единица валюты (см. src/utils/currency.js)
async function getRatesMap() {
  const result = await pool.query('SELECT * FROM currency_rates');
  const rates = {};
  result.rows.forEach(r => rates[r.code] = parseFloat(r.rate));
  return { raw: result.rows, map: rates };
}

// Получить курсы валют (в единой EGP-конвенции, плюс meta для совместимости фронта)
router.get('/', async (req, res, next) => {
  try {
    const { raw, map } = await getRatesMap();
    res.json({
      success: true,
      data: map,
      meta: {
        base: 'EGP',
        meaning: 'rate = количество EGP за 1 единицу валюты',
        updated_at: raw.map(r => ({ code: r.code, updated_at: r.updated_at }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Обновить курс одной валюты вручную (только admin).
// ВНИМАНИЕ: передаётся значение в той же EGP-конвенции, что и GET /api/rates.
router.put('/:code', authMiddleware, requireAdmin, apiLimiter, async (req, res, next) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    const rate = parseFloat(req.body.rate);

    if (!CURRENCY_CODES.includes(code)) {
      return res.status(400).json({ success: false, error: { message: 'Неизвестный код валюты' } });
    }
    if (isNaN(rate) || rate <= 0) {
      return res.status(400).json({ success: false, error: { message: 'Курс должен быть числом > 0 (кол-во EGP за 1 единицу валюты)' } });
    }
    // EGP — базовая валюта хранилища, всегда 1
    const finalRate = code === 'EGP' ? 1 : rate;

    const result = await pool.query(
      `INSERT INTO currency_rates (code, rate, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (code) DO UPDATE SET rate = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [code, finalRate]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Обновить курсы валют вручную из внешнего источника (только admin)
router.post('/refresh', authMiddleware, requireAdmin, apiLimiter, async (req, res, next) => {
  try {
    await updateCurrencyRates();

    const { map } = await getRatesMap();

    res.json({
      success: true,
      message: 'Курсы валют обновлены',
      data: map
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
