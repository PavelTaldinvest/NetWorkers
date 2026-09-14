const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Получить все заявки
router.get('/applications', authMiddleware, async (req, res, next) => {
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
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Обновить статус заявки
router.patch('/applications/:id', authMiddleware, async (req, res, next) => {
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
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Получить все объекты (админ)
router.get('/properties', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Создать объект
router.post('/properties', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const { title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/500';

    const result = await pool.query(
      `INSERT INTO properties (title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm, image_url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Обновить объект
router.put('/properties/:id', authMiddleware, async (req, res, next) => {
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
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Удалить объект
router.delete('/properties/:id', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещён' }
      });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    
    res.json({ message: 'Удалено' });
  } catch (error) {
    next(error);
  }
});

// Статистика для админки
router.get('/stats', authMiddleware, async (req, res, next) => {
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
      totalProperties: parseInt(totalProps.rows[0].count),
      totalApplications: parseInt(totalApps.rows[0].count),
      newApplications: parseInt(newApps.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
