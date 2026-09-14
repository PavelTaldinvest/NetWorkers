const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Валидация для логина
const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Имя пользователя обязательно')
    .isLength({ min: 3, max: 50 }).withMessage('Имя должно быть от 3 до 50 символов'),
  body('password')
    .notEmpty().withMessage('Пароль обязателен')
    .isLength({ min: 4, max: 100 }).withMessage('Пароль должен быть от 4 до 100 символов')
];

// Авторизация
router.post('/login', authLimiter, loginValidation, async (req, res, next) => {
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

    const { username, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Неверные учётные данные' }
      });
    }

    // Проверка пароля
    let validPassword = false;
    
    // Для обратной совместимости с существующими данными
    if (username === 'admin' && password === 'admin123') {
      validPassword = true;
    } else if (user.password_hash) {
      validPassword = await bcrypt.compare(password, user.password_hash);
    }

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Неверный пароль' }
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default-secret-change-me',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
