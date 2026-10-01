const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { updateCurrencyRates } = require('../services/currencyUpdater');

const router = express.Router();

// Получить курсы валют
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM currency_rates');
    const rates = {};
    result.rows.forEach(r => rates[r.code] = parseFloat(r.rate));
    res.json({ success: true, data: rates });
  } catch (error) {
    next(error);
  }
});

// Обновить курс одной валюты вручную (только admin)
router.put('/:code', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const code = String(req.params.code || '').toUpperCase();
    const rate = parseFloat(req.body.rate);

    if (!['USD', 'EUR', 'EGP', 'RUB'].includes(code)) {
      return res.status(400).json({ success: false, error: { message: 'Неизвестный код валюты' } });
    }
    if (isNaN(rate) || rate <= 0) {
      return res.status(400).json({ success: false, error: { message: 'Курс должен быть числом > 0' } });
    }
    // USD — базовая валюта, всегда 1
    const finalRate = code === 'USD' ? 1 : rate;

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
router.post('/refresh', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    await updateCurrencyRates();
    
    // Получаем обновлённые курсы
    const result = await pool.query('SELECT * FROM currency_rates');
    const rates = {};
    result.rows.forEach(r => rates[r.code] = parseFloat(r.rate));
    
    res.json({ 
      success: true, 
      message: 'Курсы валют обновлены',
      data: rates 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
