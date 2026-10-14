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
    .isLength({ max: 1000 }).withMessage('Сообщение не должно превышать 1000 символов'),
  body('property_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true; // заявка «без объекта» допустима
      if (!/^\d+$/.test(String(value))) {
        throw new Error('property_id должен быть числом');
      }
      return true;
    })
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

    // Нормализуем: пустая строка/null -> NULL (заявка без конкретного объекта)
    const cleanPropertyId = (property_id === '' || property_id === null || property_id === undefined)
      ? null : parseInt(property_id, 10);

    // Если объект указан — он должен существовать (защита от битых ссылок в заявках)
    if (cleanPropertyId !== null) {
      const exists = await pool.query('SELECT 1 FROM properties WHERE id = $1', [cleanPropertyId]);
      if (exists.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Объект недвижимости не найден' }
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO applications (property_id, customer_name, customer_phone, customer_email, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cleanPropertyId, customer_name, customer_phone, customer_email, message]
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
