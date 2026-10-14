// Глобальная настройка Jest: подменяем реальный пул pg мок-объектом,
// чтобы тесты не требовали установленного PostgreSQL.
process.env.JWT_SECRET = 'test-secret-for-jest-only-0123456789abcdef0123456789abcdef';
process.env.DB_PASSWORD = 'test-db-password';
process.env.NODE_ENV = 'test';

jest.mock('../src/config/db', () => require('./__mocks__/db'));
