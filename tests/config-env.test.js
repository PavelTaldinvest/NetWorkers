/**
 * Unit-тесты политики секретов (пункт №1 рекомендаций по безопасности):
 *  - fallback-секрет в коде удалён — без JWT_SECRET сервер не стартует;
 *  - слабые/известные заглушки отклоняются;
 *  - в NODE_ENV=test допускается только детерминированный тестовый секрет.
 */

// process.exit подменяем, чтобы проверять факт остановки без убийства воркера Jest.
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit:${code}`);
});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

const REAL_SECRET = 'a'.repeat(96); // валидный длинный секрет для тестов загрузки

// dotenv подменяем no-op: конфиг должен читать env из process.env,
// а не из реального .env разработчика/CI.
jest.mock('dotenv', () => ({ config: jest.fn() }));

function loadEnvWith(env) {
  const saved = { ...process.env };
  for (const k of ['JWT_SECRET', 'DB_PASSWORD', 'NODE_ENV']) delete process.env[k];
  Object.assign(process.env, env);
  delete require.cache[require.resolve('../src/config/env')];
  try {
    return { ok: true, config: require('../src/config/env') };
  } catch (e) {
    return { ok: false, error: e };
  } finally {
    for (const k of ['JWT_SECRET', 'DB_PASSWORD', 'NODE_ENV']) delete process.env[k];
    Object.assign(process.env, saved);
  }
}

// В тестах всегда явно задаём JWT_SECRET (setup.js), поэтому «пустой»
// случай эмулируем пробелами — конфиг обязан трактовать их как отсутствие секрета.
const BLANK = '   ';

describe('config/env: политика JWT_SECRET', () => {
  beforeEach(() => {
    mockExit.mockClear();
    mockConsoleError.mockClear();
  });

  it('NODE_ENV=production без JWT_SECRET → fatal и process.exit(1)', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', DB_PASSWORD: 'x', JWT_SECRET: BLANK });
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
    const r = loadEnvWith({ NODE_ENV: 'test', DB_PASSWORD: 'x', JWT_SECRET: BLANK });
    expect(r.ok).toBe(true);
    expect(r.config.JWT_SECRET).toContain('test-secret-for-jest-only');
  });

  it('без DB_PASSWORD запуск запрещён', () => {
    const r = loadEnvWith({ NODE_ENV: 'production', JWT_SECRET: REAL_SECRET, DB_PASSWORD: BLANK });
    expect(r.ok).toBe(false);
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
