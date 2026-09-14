const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Получить города
router.get('/cities', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM cities');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Получить типы недвижимости
router.get('/types', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM property_types');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
