const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Получить курсы валют
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM currency_rates');
    const rates = {};
    result.rows.forEach(r => rates[r.code] = parseFloat(r.rate));
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
