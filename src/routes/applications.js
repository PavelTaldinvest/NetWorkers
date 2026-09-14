const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Создание заявки
router.post('/', async (req, res, next) => {
  try {
    const { property_id, customer_name, customer_phone, customer_email, message } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({
        success: false,
        error: { message: 'Имя и телефон обязательны' }
      });
    }

    const result = await pool.query(
      `INSERT INTO applications (property_id, customer_name, customer_phone, customer_email, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [property_id, customer_name, customer_phone, customer_email, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
