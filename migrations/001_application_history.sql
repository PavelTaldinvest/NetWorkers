-- Миграция 001: таблица истории изменений заявок.
-- Безопасна для повторного запуска (idempotent).
-- Применение к существующей базе:
--   psql -U postgres -d egypt_estate -f migrations/001_application_history.sql

CREATE TABLE IF NOT EXISTS application_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    old_comment TEXT,
    new_comment TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_history_app ON application_history(application_id);
