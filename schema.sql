-- Схема базы данных PostgreSQL для Egypt Estate
-- Выполните этот скрипт в pgAdmin или через psql

-- Удаление таблиц если они существуют (для чистой переустановки)
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS currency_rates CASCADE;
DROP TABLE IF EXISTS property_types CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- 1. Таблица городов
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Таблица типов недвижимости
CREATE TABLE property_types (
    id SERIAL PRIMARY KEY,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Таблица пользователей (Админы, Агенты, Клиенты)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Хеш пароля (bcrypt)
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'client', -- 'admin', 'agent', 'client'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Таблица курсов валют
CREATE TABLE currency_rates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL, -- USD, EUR, EGP, RUB
    rate DECIMAL(10, 4) NOT NULL DEFAULT 1.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Таблица объектов недвижимости
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title_ru VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    price_usd DECIMAL(12, 2) NOT NULL,
    city_id INTEGER REFERENCES cities(id),
    type_id INTEGER REFERENCES property_types(id),
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm DECIMAL(8, 2),
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'rented'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Таблица заявок
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Может быть NULL если гость
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_comment TEXT
);

-- Индексы для ускорения поиска
CREATE INDEX idx_properties_city ON properties(city_id);
CREATE INDEX idx_properties_type ON properties(type_id);
CREATE INDEX idx_properties_price ON properties(price_usd);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_users_role ON users(role);

-- Начальные данные (Seed Data)

-- Города
INSERT INTO cities (name_ru, name_en, slug) VALUES 
('Хургада', 'Hurghada', 'hurghada'),
('Шарм-эль-Шейх', 'Sharm el-Sheikh', 'sharm'),
('Каир', 'Cairo', 'cairo'),
('Александрия', 'Alexandria', 'alexandria');

-- Типы
INSERT INTO property_types (name_ru, name_en, code) VALUES 
('Апартаменты', 'Apartment', 'apartment'),
('Вилла', 'Villa', 'villa'),
('Таунхаус', 'Townhouse', 'townhouse'),
('Коммерческая', 'Commercial', 'commercial');

-- Валюты
INSERT INTO currency_rates (code, rate) VALUES 
('USD', 1.00),
('EUR', 0.92),
('EGP', 47.50),
('RUB', 92.50);

-- Администратор (пароль 'admin' должен быть захеширован в реальном приложении)
-- Для примера вставляем просто заглушку, хеш нужно генерировать на бэкенде
INSERT INTO users (username, password_hash, email, full_name, role) VALUES 
('admin', '$2b$10$12345', 'admin@egyptestate.com', 'Главный Администратор', 'admin');
