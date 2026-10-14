/**
 * Unit-тесты политики секретов (пункт №1 рекомендаций по безопасности):
 *  - fallback-секрет в коде удалён — без JWT_SECRET сервер не стартует;
 *  - слабые/известные заглушки отклоняются;
 *  - в NODE_ENV=test допускается только детерминированный тестовый секрет.
 *
 * Тесты изолированы от реального .env: dotenv подменяется no-op-ом, а
 * src/config/env перечитывается через очистку require-кэша.
 */

const REAL_SECRET = 'a'.repeat(96); // валидный длинный секрет для тестов загрузки

// process.exit подменяем, чтобы проверять факт остановки без убийства воркера Jest.
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit:${code}`);
});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// dotenv подменяем no-op: конфиг должен читать env из process.env,
// а не из реального .env разработчика/CI.
jest.mock('dotenv', () => ({ config: jest.fn() }));

const TEST_KEYS = ['JWT_SECRET', 'DB_PASSWORD', 'NODE_ENV'];

// «Пустое» значение для проверки: Node трактует присвоение '' как
// «переменная существует и пуста», а не как «не задана». Поэтому пустые
// значения эмулируем через переменную-маркер, которую loadEnvWith удаляет.
const UNSET = Symbol('unset');

function loadEnvWith(env) {
  const saved = {};
  for (const k of TEST_KEYS) saved[k] = process.env[k];
  for (const k of TEST_KEYS) delete process.env[k];
  for (const [k, v] of Object.entries(env)) {
    if (v === UNSET || v === undefined || String(v).trim() === '') continue; // не задаём вовсе
    process.env[k] = v;
  }
  delete require.cache[require.resolve('../src/config/env')];
  try {
    return { ok: true, config: require('../src/config/env') };
  } catch (e) {
    return { ok: false, error: e };
  } finally {
    for (const k of TEST_KEYS) delete process.env[k];
    for (const [k, v] of Object.entries(saved)) {
      if (v !== undefined) process.env[k] = v;
    }
  }
}

describe('config/env: политика JWT_SECRET', () => {
  beforeEach(() => {
    mockExit.mockClear();
    mockConsoleError.mockClear();
  });

  it('NODE_ENV=production без JWT_SECRET → fatal и process.exit(1)', () => {
    // Пустое значение ('') dotenv/Node трактуют как «не задано»,
    // а пробелы конфиг обязан вырезать (trim) — оба случая = отсутствие секрета.
    const r = loadEnvWith({ NODE_ENV: 'production', DB_PASSWORD: 'x', JWT_SECRET: '' });
    expect(r.ok).toBe(false);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('JWT_SECRET только из пробелов считается отсутствующим', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', DB_PASSWORD: 'x', JWT_SECRET: '   ' });
    expect(r.ok).toBe(false);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('JWT_SECRET из значения по умолчанию в коде больше не используется', () => {
    const src = require('fs').readFileSync(require.resolve('../src/config/env'), 'utf8');
    expect(src).not.toMatch(/JWT_SECRET\s*\|\|\s*['"][0-9a-f]{32,}['"]/);
    expect(src).not.toContain('e0ea76ef');
  });

  it('слабая заглушка "change-me" отклоняется', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', DB_PASSWORD: 'x', JWT_SECRET: 'change-me' });
    expect(r.ok).toBe(false);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('секрет короче 32 символов отклоняется', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', DB_PASSWORD: 'x', JWT_SECRET: 'short-secret' });
    expect(r.ok).toBe(false);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('валидный секрет принимается и попадает в конфиг', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', DB_PASSWORD: 'x', JWT_SECRET: REAL_SECRET });
    expect(r.ok).toBe(true);
    expect(r.config.JWT_SECRET).toBe(REAL_SECRET);
  });

  it('NODE_ENV=test без JWT_SECRET использует безопасный тестовый секрет', () => {
    const r = loadEnvWith({ NODE_ENV: 'test', DB_PASSWORD: 'x', JWT_SECRET: '' });
    expect(r.ok).toBe(true);
    expect(r.config.JWT_SECRET).toContain('test-secret-for-jest-only');
  });

  it('без DB_PASSWORD запуск запрещён', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', JWT_SECRET: REAL_SECRET, DB_PASSWORD: '' });
    expect(r.ok).toBe(false);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('DB_PASSWORD только из пробелов считается отсутствующим', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', JWT_SECRET: REAL_SECRET, DB_PASSWORD: '   ' });
    expect(r.ok).toBe(false);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
