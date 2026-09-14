const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { applicationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Валидация для заявки
const applicationValidation = [
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Имя обязательно')
    .isLength({ min: 2, max: 100 }).withMessage('Имя должно быть от 2 до 100 символов'),
  body('customer_phone')
    .trim()
    .notEmpty().withMessage('Телефон обязателен')
    .matches(/^[0-9+\-\s()]{8,20}$/).withMessage('Неверный формат телефона'),
  body('customer_email')
    .optional()
    .isEmail().withMessage('Неверный формат email'),
  body('message')
    .optional()
    .isLength({ max: 1000 }).withMessage('Сообщение не должно превышать 1000 символов')
];

// Создание заявки
router.post('/', applicationLimiter, applicationValidation, async (req, res, next) => {
  try {
    // Проверка валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { 
          message: 'Ошибка валидации',
          details: errors.array()
        }
      });
    }

    const { property_id, customer_name, customer_phone, customer_email, message } = req.body;

    const result = await pool.query(
      `INSERT INTO applications (property_id, customer_name, customer_phone, customer_email, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [property_id, customer_name, customer_phone, customer_email, message]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
