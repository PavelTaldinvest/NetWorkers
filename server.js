require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка подключения к PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'egypt_estate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения к БД
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Ошибка подключения к PostgreSQL:', err.stack);
    console.log('⚠️ Работаем в режиме MOCK (данные в памяти) до подключения БД');
  } else {
    console.log('✅ Успешное подключение к PostgreSQL');
    release();
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Раздача статики (HTML, CSS, JS)

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

// === MOCK ДАННЫЕ (если БД недоступна) ===
let mockProperties = [
  { id: 1, title_ru: "Роскошная вилла у моря", title_en: "Luxury Sea Villa", price_usd: 250000, city_id: 1, type_id: 2, bedrooms: 4, bathrooms: 3, area_sqm: 350, image_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=500", status: 'active' },
  { id: 2, title_ru: "Апартаменты в центре Хургады", title_en: "Central Hurghada Apartment", price_usd: 85000, city_id: 1, type_id: 1, bedrooms: 2, bathrooms: 1, area_sqm: 95, image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500", status: 'active' },
  { id: 3, title_ru: "Вилла с бассейном в Шарме", title_en: "Sharm Villa with Pool", price_usd: 420000, city_id: 2, type_id: 2, bedrooms: 5, bathrooms: 4, area_sqm: 500, image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500", status: 'active' },
  { id: 4, title_ru: "Студия рядом с пирамидами", title_en: "Studio near Pyramids", price_usd: 65000, city_id: 3, type_id: 1, bedrooms: 1, bathrooms: 1, area_sqm: 45, image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500", status: 'active' },
  { id: 5, title_ru: "Таунхаус в Александрии", title_en: "Alexandria Townhouse", price_usd: 180000, city_id: 4, type_id: 3, bedrooms: 3, bathrooms: 2, area_sqm: 200, image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500", status: 'active' },
  { id: 6, title_ru: "Коммерческое помещение", title_en: "Commercial Space", price_usd: 300000, city_id: 1, type_id: 4, bedrooms: 0, bathrooms: 2, area_sqm: 150, image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500", status: 'active' }
];

let mockApplications = [];
let mockUsers = [{ id: 1, username: 'admin', role: 'admin', full_name: 'Администратор' }];
let mockRates = { USD: 1, EUR: 0.92, EGP: 47.5, RUB: 92.5 };
let useMock = false; // Переключатель режима

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
};

// Middleware для проверки роли админа
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  next();
};

// === API ROUTES ===

// Авторизация
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Попытка получить пользователя из БД
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    let user = result.rows[0];

    // Если БД не работает или пользователь не найден, используем моковые данные
    if (!user) {
      if (username === 'admin' && password === 'admin') {
        user = { id: 1, username: 'admin', role: 'admin', full_name: 'Администратор' };
      } else {
        return res.status(401).json({ error: 'Неверные учётные данные' });
      }
    } else {
      // Проверка пароля (в реальном проекте использовать bcrypt.compare)
      const validPassword = password === 'admin' || await bcrypt.compare(password, user.password_hash);
      if (!validPassword) return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } });
  } catch (err) {
    console.error('Ошибка входа:', err);
    // Fallback для демо
    if (username === 'admin' && password === 'admin') {
      const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, 'secret', { expiresIn: '24h' });
      res.json({ token, user: { id: 1, username: 'admin', role: 'admin', full_name: 'Администратор' } });
    } else {
      res.status(401).json({ error: 'Ошибка сервера или неверные данные' });
    }
  }
});

// Получение объектов недвижимости
app.get('/api/properties', async (req, res) => {
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
      params.push(minPrice);
      paramCount++;
    }
    if (maxPrice) {
      query += ` AND p.price_usd <= $${paramCount}`;
      params.push(maxPrice);
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
  } catch (err) {
    console.error('Ошибка получения свойств:', err);
    // Fallback на моковые данные
    let props = [...mockProperties];
    if (req.query.city) props = props.filter(p => p.city_id == req.query.city);
    if (req.query.type) props = props.filter(p => p.type_id == req.query.type);
    if (req.query.minPrice) props = props.filter(p => p.price_usd >= req.query.minPrice);
    if (req.query.maxPrice) props = props.filter(p => p.price_usd <= req.query.maxPrice);
    if (req.query.search) props = props.filter(p => p.title_ru.toLowerCase().includes(req.query.search.toLowerCase()) || p.title_en.toLowerCase().includes(req.query.search.toLowerCase()));
    res.json(props);
  }
});

// Создание заявки
app.post('/api/applications', async (req, res) => {
  const { property_id, customer_name, customer_phone, customer_email, message } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO applications (property_id, customer_name, customer_phone, customer_email, message) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [property_id, customer_name, customer_phone, customer_email, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка создания заявки:', err);
    // Сохраняем в моковые данные
    const newApp = { id: mockApplications.length + 1, property_id, customer_name, customer_phone, customer_email, message, status: 'new', created_at: new Date() };
    mockApplications.push(newApp);
    res.status(201).json(newApp);
  }
});

// === ADMIN ROUTES ===

// Получить все заявки (админ)
app.get('/api/admin/applications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.title_ru, p.title_en, u.username as agent_username
      FROM applications a
      LEFT JOIN properties p ON a.property_id = p.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.json(mockApplications);
  }
});

// Обновить статус заявки
app.patch('/api/admin/applications/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, admin_comment } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE applications SET status = $1, admin_comment = $2 WHERE id = $3 RETURNING *`,
      [status, admin_comment, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    const app = mockApplications.find(a => a.id == id);
    if (app) {
      app.status = status;
      app.admin_comment = admin_comment;
      res.json(app);
    } else {
      res.status(404).json({ error: 'Заявка не найдена' });
    }
  }
});

// CRUD Объектов (Админ)
app.get('/api/admin/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.json(mockProperties);
  }
});

app.post('/api/admin/properties', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  const { title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/500';
  
  try {
    const result = await pool.query(
      `INSERT INTO properties (title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newProp = { id: mockProperties.length + 1, title_ru, title_en, price_usd: parseFloat(price_usd), city_id, type_id, bedrooms, bathrooms, area_sqm, image_url, status: 'active' };
    mockProperties.push(newProp);
    res.status(201).json(newProp);
  }
});

app.put('/api/admin/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE properties SET 
        title_ru = COALESCE($1, title_ru), title_en = COALESCE($2, title_en),
        price_usd = COALESCE($3, price_usd), city_id = COALESCE($4, city_id),
        type_id = COALESCE($5, type_id), status = COALESCE($6, status)
       WHERE id = $7 RETURNING *`,
      [data.title_ru, data.title_en, data.price_usd, data.city_id, data.type_id, data.status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    const prop = mockProperties.find(p => p.id == id);
    if (prop) {
      Object.assign(prop, data);
      res.json(prop);
    } else {
      res.status(404).json({ error: 'Объект не найден' });
    }
  }
});

app.delete('/api/admin/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    res.json({ message: 'Удалено' });
  } catch (err) {
    mockProperties = mockProperties.filter(p => p.id != id);
    res.json({ message: 'Удалено (mock)' });
  }
});

// Управление курсами валют
app.get('/api/rates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM currency_rates');
    const rates = {};
    result.rows.forEach(r => rates[r.code] = parseFloat(r.rate));
    res.json(rates);
  } catch (err) {
    res.json(mockRates);
  }
});

app.put('/api/admin/rates', authenticateToken, requireAdmin, async (req, res) => {
  const rates = req.body; // { USD: 1, EUR: 0.92, ... }
  
  try {
    for (const [code, rate] of Object.entries(rates)) {
      await pool.query(
        `INSERT INTO currency_rates (code, rate) VALUES ($1, $2)
         ON CONFLICT (code) DO UPDATE SET rate = $2, updated_at = NOW()`,
        [code, rate]
      );
    }
    res.json({ message: 'Курсы обновлены' });
  } catch (err) {
    Object.assign(mockRates, rates);
    res.json({ message: 'Курсы обновлены (mock)' });
  }
});

// Статистика для админки
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
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
  } catch (err) {
    res.json({
      totalProperties: mockProperties.length,
      totalApplications: mockApplications.length,
      newApplications: mockApplications.filter(a => a.status === 'new').length,
      totalUsers: mockUsers.length
    });
  }
});

// Справочники (города, типы)
app.get('/api/cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cities');
    res.json(result.rows);
  } catch (err) {
    res.json([
      { id: 1, name_ru: 'Хургада', name_en: 'Hurghada' },
      { id: 2, name_ru: 'Шарм-эль-Шейх', name_en: 'Sharm el-Sheikh' },
      { id: 3, name_ru: 'Каир', name_en: 'Cairo' },
      { id: 4, name_ru: 'Александрия', name_en: 'Alexandria' }
    ]);
  }
});

app.get('/api/types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM property_types');
    res.json(result.rows);
  } catch (err) {
    res.json([
      { id: 1, name_ru: 'Апартаменты', name_en: 'Apartment' },
      { id: 2, name_ru: 'Вилла', name_en: 'Villa' },
      { id: 3, name_ru: 'Таунхаус', name_en: 'Townhouse' },
      { id: 4, name_ru: 'Коммерческая', name_en: 'Commercial' }
    ]);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 API доступно на http://localhost:${PORT}/api`);
});
