const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Настройка загрузки файлов (Multer 2.x совместимость)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB лимит
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Валидация для создания объекта
const propertyValidation = [
  body('title_ru').trim().notEmpty().withMessage('Название (RU) обязательно').isLength({ max: 200 }),
  body('title_en').trim().notEmpty().withMessage('Название (EN) обязательно').isLength({ max: 200 }),
  body('price_usd').isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
  body('city_id').isInt({ min: 1 }).withMessage('Неверный ID города'),
  body('type_id').isInt({ min: 1 }).withMessage('Неверный ID типа'),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isInt({ min: 0 }),
  body('area_sqm').optional().isFloat({ min: 0 })
];

// Получить все заявки
router.get('/applications', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const result = await pool.query(`
      SELECT a.*, p.title_ru, p.title_en, u.username as agent_username
      FROM applications a
      LEFT JOIN properties p ON a.property_id = p.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Обновить статус заявки
router.patch('/applications/:id', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const { id } = req.params;
    const { status, admin_comment } = req.body;

    const result = await pool.query(
      `UPDATE applications SET status = $1, admin_comment = $2 WHERE id = $3 RETURNING *`,
      [status, admin_comment, id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Получить все объекты (админ)
router.get('/properties', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Создать объект
router.post('/properties', authMiddleware, upload.single('image'), propertyValidation, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

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

    const { title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/500';

    const result = await pool.query(
      `INSERT INTO properties (title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm, image_url]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Обновить объект
router.put('/properties/:id', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const { id } = req.params;
    const data = req.body;

    const result = await pool.query(
      `UPDATE properties SET
        title_ru = COALESCE($1, title_ru), title_en = COALESCE($2, title_en),
        price_usd = COALESCE($3, price_usd), city_id = COALESCE($4, city_id),
        type_id = COALESCE($5, type_id), status = COALESCE($6, status)
       WHERE id = $7 RETURNING *`,
      [data.title_ru, data.title_en, data.price_usd, data.city_id, data.type_id, data.status, id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Удалить объект
router.delete('/properties/:id', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'Удалено' });
  } catch (error) {
    next(error);
  }
});

// Статистика для админки
router.get('/stats', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const totalProps = await pool.query('SELECT COUNT(*) FROM properties');
    const totalApps = await pool.query('SELECT COUNT(*) FROM applications');
    const newApps = await pool.query("SELECT COUNT(*) FROM applications WHERE status = 'new'");
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');

    res.json({
      success: true,
      data: {
        totalProperties: parseInt(totalProps.rows[0].count),
        totalApplications: parseInt(totalApps.rows[0].count),
        newApplications: parseInt(newApps.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
