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

// Обновить курсы валют вручную (только admin)
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
