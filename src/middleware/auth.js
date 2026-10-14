const jwt = require('jsonwebtoken');
const config = require('../config/env');
const pool = require('../config/db');

// Проверка JWT-токена + актуального статуса пользователя в БД.
// Токен сам по себе может «пережить» отключение администратора,
// поэтому role/is_active всегда берём из базы, а не из токена.
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Требуется авторизация' }
      });
    }

    const token = authHeader.split(' ')[1];
    // Секрет обязателен — проверка его наличия выполнена в config/env.js
    const decoded = jwt.verify(token, config.JWT_SECRET);

    let dbUser;
    try {
      const result = await pool.query(
        'SELECT id, username, role, full_name, is_active FROM users WHERE id = $1',
        [decoded.id]
      );
      dbUser = result.rows[0];
    } catch (dbError) {
      console.error('Ошибка БД при проверке токена:', dbError.message);
      return res.status(503).json({
        success: false,
        error: { message: 'Сервер базы данных недоступен' }
      });
    }

    if (!dbUser || !dbUser.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Пользователь не найден или деактивирован' }
      });
    }

    // Данные берём из БД, а не из токена — роль/имя всегда актуальны
    req.user = dbUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Токен истёк' }
      });
    }

    return res.status(401).json({
      success: false,
      error: { message: 'Неверный токен' }
    });
  }
};

// Единая проверка роли администратора (использовать ПОСЛЕ authMiddleware).
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Доступ запрещён' }
    });
  }
  next();
};

module.exports = authMiddleware;
module.exports.requireAdmin = requireAdmin;
