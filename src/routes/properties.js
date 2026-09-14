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

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
