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

-- Администратор: пароль хранится ТОЛЬКО как bcrypt-хеш.
-- Смена пароля: node scripts/update-admin-password.js "НОВЫЙ_ПАРОЛЬ"
INSERT INTO users (username, password_hash, email, full_name, role) VALUES
('admin', '$2b$10$A1RmSxswgvDMFIjR0/OOiO0AXFsxK1Mc9VLBXaOSVcIVYWYhjpXKi', 'admin@egyptestate.com', 'Главный Администратор', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Демо-объекты для каталога (замените реальными данными перед продакшеном)
INSERT INTO properties (title_ru, title_en, description_ru, description_en, price_usd, city_id, type_id, bedrooms, bathrooms, area_sqm, image_url, is_featured, status) VALUES
('2-комн. апартаменты с видом на море', '2-Bed Apartment with Sea View', 'Просторные апартаменты в центре Хургады, 5 минут до пляжа. Свежий ремонт, полная мебель.', 'Spacious apartment in central Hurghada, 5 min to the beach. Fresh renovation, fully furnished.', 85000, 1, 1, 2, 1, 95, '/favicon.png', true, 'active'),
('Вилла с бассейном в Эль-Гуне', 'Villa with Pool in El Gouna', 'Двухэтажная вилла с собственным бассейном и садом. Тихий район, 10 минут до marina.', 'Two-story villa with private pool and garden. Quiet neighborhood, 10 min to marina.', 240000, 1, 2, 4, 3, 280, '/favicon.png', true, 'active'),
('Студия в Шарм-эль-Шейхе', 'Studio in Sharm el-Sheikh', 'Уютная студия в комплексе с бассейном рядом с Naama Bay. Отличный вариант под аренду или отдых.', 'Cozy studio in a complex with pool near Naama Bay. Great for rental or vacation.', 48000, 2, 1, 1, 1, 42, '/favicon.png', false, 'active'),
('3-комн. пентхаус в Новом Каире', '3-Bed Penthouse in New Cairo', 'Элитный пентхаус с террасой 60 м² и панорамным видом. Закрытый клуб, охрана 24/7.', 'Elite penthouse with 60 m² terrace and panoramic view. Private club, 24/7 security.', 310000, 3, 1, 3, 3, 210, '/favicon.png', true, 'active'),
('Таунхаус у моря, Александрия', 'Seaside Townhouse, Alexandria', 'Семейный таунхаус в историческом районе Александрии, 3 уровня, гараж, вид на Средиземное море.', 'Family townhouse in historic Alexandria district, 3 levels, garage, Mediterranean view.', 165000, 4, 3, 3, 2, 180, '/favicon.png', false, 'active'),
('Коммерческое помещение на первой линии', 'Prime Commercial Space', 'Готовый бизнес: помещение 120 м² на первой береговой линии, высокий трафик, договор аренды до 2030.', 'Turnkey business: 120 m² space on the first seafront line, high traffic, lease until 2030.', 195000, 2, 4, 0, 2, 120, '/favicon.png', false, 'reserved');
