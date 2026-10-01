const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Получение списка объектов с фильтрацией
router.get('/', async (req, res, next) => {
  try {
    const { city, type, minPrice, maxPrice, search } = req.query;

    let query = `
      SELECT p.*, c.name_ru as city_name_ru, c.name_en as city_name_en,
             t.name_ru as type_name_ru, t.name_en as type_name_en
      FROM properties p
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN property_types t ON p.type_id = t.id
      WHERE p.status = 'active'
    `;
    
    const params = [];
    let paramCount = 1;

    if (city) {
      query += ` AND p.city_id = $${paramCount}`;
      params.push(city);
      paramCount++;
    }
    if (type) {
      query += ` AND p.type_id = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    if (minPrice) {
      query += ` AND p.price_usd >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }
    if (maxPrice) {
      query += ` AND p.price_usd <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }
    if (search) {
      query += ` AND (p.title_ru ILIKE $${paramCount} OR p.title_en ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += " ORDER BY is_featured DESC NULLS LAST, created_at DESC";

    const result = await pool.query(query, params);
    // Единый формат ответа с остальными эндпоинтами: { success, data }
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Детальная страница объекта (включая неактивные — для модалки из админки)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, error: { message: 'Неверный ID объекта' } });
    }

    const result = await pool.query(`
      SELECT p.*, c.name_ru as city_name_ru, c.name_en as city_name_en,
             t.name_ru as type_name_ru, t.name_en as type_name_en
      FROM properties p
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN property_types t ON p.type_id = t.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Объект не найден' } });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
