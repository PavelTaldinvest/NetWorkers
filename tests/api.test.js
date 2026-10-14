/**
 * Интеграционные тесты API (БД замокана, реальный PostgreSQL не требуется).
 * Запуск: npm test
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');

const pool = require('./__mocks__/db'); // тот же объект, что подставлен в src/config/db
const config = require('../src/config/env');

// app подключаем ПОСЛЕ jest.mock (в setup.js) — роуты получат мок-пул
const app = require('../src/app');

const adminToken = jwt.sign({ id: 1, username: 'admin' }, config.JWT_SECRET, { expiresIn: '1h' });
const userRow = { id: 1, username: 'admin', role: 'admin', full_name: 'Admin', is_active: true };

beforeEach(() => {
  pool.__mockQuery.mockReset();
  pool.connect.mockResolvedValue({ query: pool.__mockQuery, release: jest.fn() });
});

describe('GET /api/health', () => {
  it('возвращает 200 и db:true при доступной БД', async () => {
    pool.__mockQuery.mockResolvedValueOnce({ rows: [{ now: new Date() }] });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.db).toBe(true);
  });

  it('возвращает 503 при недоступной БД', async () => {
    pool.__mockQuery.mockRejectedValueOnce(new Error('connection refused'));
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.db).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('400 без обязательных полей', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'ad' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('401 при неизвестном пользователе (без утечки "пользователь не найден")', async () => {
    pool.__mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'ghost', password: 'secret123' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Неверные учётные данные');
  });

  it('503 при ошибке БД', async () => {
    pool.__mockQuery.mockRejectedValueOnce(new Error('SASL fail'));
    const res = await request(app).post('/api/auth/login')
      .send({ username: 'admin', password: 'secret123' });
    expect(res.status).toBe(503);
  });
});

describe('GET /api/properties', () => {
  const props = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1, title_ru: `Объект ${i + 1}`, title_en: `Prop ${i + 1}`,
    price_usd: '100000.00', city_name_ru: 'Хургада', status: 'active',
  }));

  it('пагинация: page/limit + pagination в ответе', async () => {
    pool.__mockQuery
      .mockResolvedValueOnce({ rows: props })            // основной запрос
      .mockResolvedValueOnce({ rows: [{ cnt: '25' }] }); // count-запрос
    const res = await request(app).get('/api/properties?page=2&limit=3');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.pagination).toEqual({ page: 2, limit: 3, total: 25, totalPages: 9 });
  });

  it('limit ограничен сверху 100', async () => {
    pool.__mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ cnt: '0' }] });
    const res = await request(app).get('/api/properties?limit=99999');
    expect(res.body.pagination.limit).toBe(100);
  });

  it('all=1 возвращает все без LIMIT', async () => {
    pool.__mockQuery
      .mockResolvedValueOnce({ rows: props })
      .mockResolvedValueOnce({ rows: [{ cnt: '3' }] });
    const res = await request(app).get('/api/properties?all=1');
    expect(res.body.data).toHaveLength(3);
    const mainSql = pool.__mockQuery.mock.calls[0][0];
    expect(mainSql).not.toMatch(/LIMIT/i);
  });
});

describe('POST /api/applications', () => {
  it('400 при неверном property_id', async () => {
    const res = await request(app).post('/api/applications')
      .send({ customer_name: 'Иван', customer_phone: '+20100000000', property_id: 'abc' });
    expect(res.status).toBe(400);
  });

  it('400 если указанный объект не найден', async () => {
    pool.__mockQuery.mockResolvedValueOnce({ rows: [] }); // SELECT 1 FROM properties
    const res = await request(app).post('/api/applications')
      .send({ customer_name: 'Иван', customer_phone: '+20100000000', property_id: '999' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/не найден/i);
  });

  it('201 для заявки без объекта', async () => {
    pool.__mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'new' }] });
    const res = await request(app).post('/api/applications')
      .send({ customer_name: 'Иван', customer_phone: '+20100000000' });
    expect(res.status).toBe(201);
    // В INSERT должен уйти NULL для property_id
    expect(pool.__mockQuery.mock.calls[0][1][0]).toBeNull();
  });
});

describe('Админ-эндпоинты', () => {
  it('401 без токена', async () => {
    const res = await request(app).get('/api/admin/applications');
    expect(res.status).toBe(401);
  });

  it('403 для не-администратора', async () => {
    const token = jwt.sign({ id: 2 }, config.JWT_SECRET);
    pool.__mockQuery.mockResolvedValueOnce({ rows: [{ id: 2, username: 'agent', role: 'agent', is_active: true }] });
    const res = await request(app).get('/api/admin/applications').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('PATCH заявки пишет запись в application_history (транзакция)', async () => {
    // authMiddleware: пользователь из БД
    pool.__mockQuery
      .mockResolvedValueOnce({ rows: [userRow] })                       // auth
      .mockResolvedValueOnce({ rows: [{ id: 5, status: 'new', admin_comment: null }] }) // SELECT FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ id: 5, status: 'contacted', admin_comment: 'Позвонили' }] }) // UPDATE
      .mockResolvedValueOnce({ rows: [] });                             // INSERT history
    const res = await request(app)
      .patch('/api/admin/applications/5')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'contacted', admin_comment: 'Позвонили' });

    expect(res.status).toBe(200);
    const sqls = pool.__mockQuery.mock.calls.map(c => c[0]);
    expect(sqls.some(s => /BEGIN/i.test(s))).toBe(true);
    expect(sqls.some(s => /INSERT INTO application_history/i.test(s))).toBe(true);
    expect(sqls.some(s => /COMMIT/i.test(s))).toBe(true);
    // changed_by = id админа из req.user
    const histCall = pool.__mockQuery.mock.calls.find(c => /application_history/.test(c[0]));
    expect(histCall[1][1]).toBe(userRow.id);
  });

  it('PATCH с недопустимым статусом — 400', async () => {
    pool.__mockQuery.mockResolvedValueOnce({ rows: [userRow] }); // auth
    const res = await request(app)
      .patch('/api/admin/applications/5')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'deleted' });
    expect(res.status).toBe(400);
  });

  it('GET истории заявки требует авторизации и возвращает данные', async () => {
    pool.__mockQuery
      .mockResolvedValueOnce({ rows: [userRow] })   // auth
      .mockResolvedValueOnce({ rows: [{ id: 1, old_status: 'new', new_status: 'contacted' }] });
    const res = await request(app)
      .get('/api/admin/applications/5/history')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('Справочники', () => {
  it('GET /api/cities', async () => {
    pool.__mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name_ru: 'Хургада' }] });
    const res = await request(app).get('/api/cities');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name_ru).toBe('Хургада');
  });
});
