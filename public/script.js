// ==================== Конфигурация API ====================
const API_URL = window.location.origin.startsWith('http') && window.location.port !== '3000'
    ? 'http://localhost:3000/api'
    : '/api';

// ==================== Состояние приложения ====================
let state = {
    language: 'ru',
    currency: 'USD',
    theme: 'light',
    token: null,
    user: null,
    properties: [],
    cities: [],
    types: [],
    rates: { USD: 1, EUR: 0.92, EGP: 47.5, RUB: 92.5 }
};

// ==================== Переводы ====================
const translations = {
    ru: {
        home: 'Главная',
        catalog: 'Каталог',
        admin: 'Админка',
        hero_title: 'Найдите свою идеальную недвижимость в Египте',
        hero_subtitle: 'Виллы, апартаменты и коммерческая недвижимость на побережье Красного моря',
        browse_catalog: 'Смотреть каталог',
        featured_properties: 'Избранные объекты',
        all_cities: 'Все города',
        all_types: 'Все типы',
        search_placeholder: 'Поиск...',
        min_price: 'Мин. цена',
        max_price: 'Макс. цена',
        filter: 'Фильтр',
        admin_login: 'Вход для администраторов',
        login: 'Войти',
        logout: 'Выйти',
        admin_panel: 'Панель управления',
        total_properties: 'Объектов',
        total_applications: 'Заявок',
        new_applications: 'Новых',
        total_users: 'Пользователей',
        properties_tab: 'Объекты',
        applications_tab: 'Заявки',
        currencies_tab: 'Валюты',
        add_property_tab: 'Добавить объект',
        title: 'Название',
        price: 'Цена ($)',
        city: 'Город',
        actions: 'Действия',
        customer: 'Клиент',
        phone: 'Телефон',
        property: 'Объект',
        message: 'Сообщение',
        status: 'Статус',
        comment: 'Комментарий',
        save_rates: 'Сохранить курсы',
        refresh_rates: 'Обновить из курса ЦБ',
        add_property: 'Добавить объект',
        request_info: 'Запросить информацию',
        send_request: 'Отправить заявку',
        edit: 'Ред.',
        delete: 'Удалить',
        view: 'Просмотр',
        no_properties: 'Нет объектов',
        loading: 'Загрузка…',
        conn_err: 'Ошибка подключения к серверу. Проверьте интернет и попробуйте ещё раз.',
        retry: 'Повторить',
        confirm_delete: 'Вы уверены?',
        status_new: 'Новая',
        status_contacted: 'Контакт',
        status_completed: 'Завершена',
        status_cancelled: 'Отменена',
        prop_active: 'Активен',
        prop_sold: 'Продан',
        prop_rented: 'Аренда',
        saved_ok: 'Сохранено!',
        err_server: 'Ошибка подключения к серверу',
        err_login: 'Неверные учётные данные',
        app_sent: 'Заявка отправлена!',
        app_err: 'Ошибка отправки заявки. Проверьте данные.',
        rates_saved: 'Курсы обновлены!',
        rates_refreshed: 'Курсы обновлены из внешнего источника',
        rates_err: 'Ошибка обновления курсов',
        prop_added: 'Объект добавлен!',
        prop_err: 'Ошибка добавления объекта. Проверьте данные.',
        prop_updated: 'Объект обновлён!',
        fill_required: 'Заполните обязательные поля'
    },
    en: {
        home: 'Home',
        catalog: 'Catalog',
        admin: 'Admin',
        hero_title: 'Find Your Perfect Property in Egypt',
        hero_subtitle: 'Villas, apartments and commercial real estate on the Red Sea coast',
        browse_catalog: 'Browse Catalog',
        featured_properties: 'Featured Properties',
        all_cities: 'All Cities',
        all_types: 'All Types',
        search_placeholder: 'Search...',
        min_price: 'Min Price',
        max_price: 'Max Price',
        filter: 'Filter',
        admin_login: 'Admin Login',
        login: 'Login',
        logout: 'Logout',
        admin_panel: 'Admin Panel',
        total_properties: 'Properties',
        total_applications: 'Applications',
        new_applications: 'New',
        total_users: 'Users',
        properties_tab: 'Properties',
        applications_tab: 'Applications',
        currencies_tab: 'Currencies',
        add_property_tab: 'Add Property',
        title: 'Title',
        price: 'Price ($)',
        city: 'City',
        actions: 'Actions',
        customer: 'Customer',
        phone: 'Phone',
        property: 'Property',
        message: 'Message',
        status: 'Status',
        comment: 'Comment',
        save_rates: 'Save Rates',
        refresh_rates: 'Refresh from API',
        add_property: 'Add Property',
        request_info: 'Request Information',
        send_request: 'Send Request',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        no_properties: 'No properties',
        loading: 'Loading…',
        conn_err: 'Server connection error. Check your internet and try again.',
        retry: 'Retry',
        confirm_delete: 'Are you sure?',
        status_new: 'New',
        status_contacted: 'Contacted',
        status_completed: 'Completed',
        status_cancelled: 'Cancelled',
        prop_active: 'Active',
        prop_sold: 'Sold',
        prop_rented: 'Rented',
        saved_ok: 'Saved!',
        err_server: 'Server connection error',
        err_login: 'Invalid credentials',
        app_sent: 'Request sent!',
        app_err: 'Error sending request. Check your data.',
        rates_saved: 'Rates updated!',
        rates_refreshed: 'Rates refreshed from external source',
        rates_err: 'Error updating rates',
        prop_added: 'Property added!',
        prop_err: 'Error adding property. Check your data.',
        prop_updated: 'Property updated!',
        fill_required: 'Fill in the required fields'
    }
};

// ==================== Вспомогательные функции ====================
function t(key) {
    return (translations[state.language] && translations[state.language][key]) || key;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Единый fetch с разбором формата ответа бэкенда ({success, data} / {error})
async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, options);
    let body = null;
    try { body = await res.json(); } catch (e) { /* пустое/не-JSON */ }

    if (!res.ok) {
        const msg = (body && body.error && (body.error.details
            ? body.error.details.map(d => d.msg).join('; ')
            : body.error.message)) || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status; // чтобы logout() не вызывался рекурсивно из validateToken()
        throw err;
    }
    // Некоторые эндпоинты возвращают массив напрямую (cities/types), другие — {success, data}
    if (Array.isArray(body)) return body;
    if (body && 'data' in body) return body.data;
    return body;
}

function authHeaders(extra = {}) {
    return { Authorization: `Bearer ${state.token}`, ...extra };
}

// При протухшем токене — разлогиниваемся
function handleAuthError(err) {
    if (err && /истёк|токен|авторизац/i.test(err.message || '')) {
        logout(true);
    }
}

// ==================== Инициализация ====================
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initNavigation();
    initThemeToggle();
    initLanguageSelect();
    initCurrencySelect();
    updateTranslations();
    loadRates().then(() => {
        loadProperties();
    });
    loadCitiesAndTypes();
});

// Загрузка настроек из localStorage
function loadSettings() {
    try {
        const saved = localStorage.getItem('egyptEstateSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            state.language = settings.language || 'ru';
            state.currency = settings.currency || 'USD';
            state.theme = settings.theme || 'light';
            state.token = settings.token || null;
            state.user = settings.user || null;
        }
    } catch (e) { /* повреждённые настройки игнорируем */ }

    applyTheme(state.theme);
    document.getElementById('languageSelect').value = state.language;
    document.getElementById('currencySelect').value = state.currency;

    if (state.token) {
        // Проверяем токен на сервере: если он недействителен (сменился JWT_SECRET,
        // истёк срок или сервер перезапускали) — остаёмся на форме входа.
        validateToken().then((valid) => {
            if (valid) {
                showAdminPanel();
            } else {
                logout(true);
            }
        });
    }
}

function saveSettings() {
    localStorage.setItem('egyptEstateSettings', JSON.stringify({
        language: state.language,
        currency: state.currency,
        theme: state.theme,
        token: state.token,
        user: state.user
    }));
}

// ==================== Навигация ====================
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    const pageEl = document.getElementById(`${pageName}-page`);
    if (pageEl) pageEl.classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

    if (pageName === 'catalog') {
        loadProperties();
    } else if (pageName === 'home') {
        loadFeaturedProperties();
    }
}

// ==================== Тема ====================
function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    btn.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(state.theme);
        saveSettings();
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ==================== Язык ====================
function initLanguageSelect() {
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        state.language = e.target.value;
        updateTranslations();
        saveSettings();
        populateSelects();
        loadProperties();
        if (state.token) loadAdminData();
    });
}

function updateTranslations() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        if (t(key) !== key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.dataset.langPlaceholder;
        if (t(key) !== key) el.placeholder = t(key);
    });
}

// ==================== Валюта ====================
function initCurrencySelect() {
    document.getElementById('currencySelect').addEventListener('change', (e) => {
        state.currency = e.target.value;
        saveSettings();
        renderProperties(state.properties, 'propertiesGrid');
        loadFeaturedProperties();
    });
}

function convertPrice(priceUSD) {
    const rate = state.rates[state.currency] || 1;
    const converted = parseFloat(priceUSD || 0) * rate;
    const symbols = { USD: '$', EUR: '€', EGP: '£', RUB: '₽' };
    return `${symbols[state.currency] || state.currency} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// ==================== Каталог ====================
let _catalogRetried = false; // одна повторная попытка при «плавающем» сетевом сбое

async function loadProperties() {
    const grid = document.getElementById('propertiesGrid');
    if (grid) grid.innerHTML = `<p style="text-align:center;padding:40px;">${t('loading')}</p>`;

    try {
        const params = new URLSearchParams();
        const city = document.getElementById('cityFilter')?.value;
        const type = document.getElementById('typeFilter')?.value;
        const min = document.getElementById('minPrice')?.value;
        const max = document.getElementById('maxPrice')?.value;
        const search = document.getElementById('searchInput')?.value.trim();

        if (city) params.append('city', city);
        if (type) params.append('type', type);
        if (min) params.append('minPrice', min);
        if (max) params.append('maxPrice', max);
        if (search) params.append('search', search);

        try {
            state.properties = await apiFetch(`/properties?${params}`);
        } catch (err) {
            // Сетевой сбой/таймаут туннеля — один автоматический повтор
            if (!_catalogRetried && !err.status) {
                _catalogRetried = true;
                await new Promise(r => setTimeout(r, 1200));
                state.properties = await apiFetch(`/properties?${params}`);
            } else {
                throw err;
            }
        }
        _catalogRetried = false;
        renderProperties(state.properties, 'propertiesGrid');
        loadFeaturedProperties();
    } catch (err) {
        console.error('Ошибка загрузки свойств:', err);
        if (grid) {
            grid.innerHTML = `
                <div style="text-align:center;padding:40px;grid-column:1/-1;">
                    <p>${t('conn_err')}</p>
                    <button class="btn btn-primary" onclick="loadProperties()">${t('retry')}</button>
                </div>`;
        }
    }
}

function loadFeaturedProperties() {
    const featured = state.properties.slice(0, 3);
    renderProperties(featured, 'featuredProperties');
}

function renderProperties(properties, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!properties || properties.length === 0) {
        container.innerHTML = `<p style="text-align:center;padding:40px;">${t('no_properties')}</p>`;
        return;
    }

    container.innerHTML = properties.map(prop => {
        const title = state.language === 'ru' ? prop.title_ru : prop.title_en;
        const city = state.language === 'ru' ? prop.city_name_ru : prop.city_name_en;
        return `
            <div class="property-card" onclick="openPropertyModal(${prop.id})">
                <img src="${escapeHtml(prop.image_url || '/favicon.png')}" alt="${escapeHtml(title)}">
                <div class="property-card-content">
                    <h3 class="property-card-title">${escapeHtml(title)}</h3>
                    <p class="property-card-price">${convertPrice(prop.price_usd)}</p>
                    <p class="property-card-city"><i class="fas fa-location-dot"></i> ${escapeHtml(city || '')}</p>
                    <div class="property-card-details">
                        <span><i class="fas fa-bed"></i> ${prop.bedrooms ?? '-'}</span>
                        <span><i class="fas fa-bath"></i> ${prop.bathrooms ?? '-'}</span>
                        <span><i class="fas fa-ruler-combined"></i> ${prop.area_sqm ?? '-'} м²</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadCitiesAndTypes() {
    try {
        const [cities, types] = await Promise.all([
            apiFetch('/cities'),
            apiFetch('/types')
        ]);
        state.cities = cities;
        state.types = types;
    } catch (err) {
        console.warn('Сервер недоступен, используем демо-данные справочников');
        state.cities = [
            { id: 1, name_ru: 'Хургада', name_en: 'Hurghada' },
            { id: 2, name_ru: 'Шарм-эль-Шейх', name_en: 'Sharm el-Sheikh' },
            { id: 3, name_ru: 'Каир', name_en: 'Cairo' },
            { id: 4, name_ru: 'Александрия', name_en: 'Alexandria' }
        ];
        state.types = [
            { id: 1, name_ru: 'Апартаменты', name_en: 'Apartment' },
            { id: 2, name_ru: 'Вилла', name_en: 'Villa' },
            { id: 3, name_ru: 'Таунхаус', name_en: 'Townhouse' },
            { id: 4, name_ru: 'Коммерческая', name_en: 'Commercial' }
        ];
    }
    populateSelects();
}

function populateSelects() {
    const getName = (item) => state.language === 'ru' ? item.name_ru : item.name_en;

    const cityFilter = document.getElementById('cityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const propCity = document.getElementById('propCity');
    const propType = document.getElementById('propType');

    if (cityFilter) {
        const cur = cityFilter.value;
        cityFilter.innerHTML = `<option value="">${t('all_cities')}</option>` +
            state.cities.map(c => `<option value="${c.id}">${escapeHtml(getName(c))}</option>`).join('');
        cityFilter.value = cur;
    }
    if (typeFilter) {
        const cur = typeFilter.value;
        typeFilter.innerHTML = `<option value="">${t('all_types')}</option>` +
            state.types.map(ty => `<option value="${ty.id}">${escapeHtml(getName(ty))}</option>`).join('');
        typeFilter.value = cur;
    }
    if (propCity) {
        propCity.innerHTML = '<option value="">Город / City</option>' +
            state.cities.map(c => `<option value="${c.id}">${escapeHtml(getName(c))}</option>`).join('');
    }
    if (propType) {
        propType.innerHTML = '<option value="">Тип / Type</option>' +
            state.types.map(ty => `<option value="${ty.id}">${escapeHtml(getName(ty))}</option>`).join('');
    }
}

function applyFilters() {
    loadProperties();
}

// ==================== Модалка объекта ====================
async function openPropertyModal(id) {
    let prop = state.properties.find(p => p.id === id);

    // Если объекта нет в текущем списке (например, открыт из админки или
    // отфильтрован) — догружаем его с сервера: GET /api/properties/:id
    if (!prop) {
        try {
            prop = await apiFetch(`/properties/${id}`);
        } catch (err) {
            console.warn(`Не удалось загрузить объект ${id}:`, err.message);
            return;
        }
    }
    if (!prop) return;

    const title = state.language === 'ru' ? prop.title_ru : prop.title_en;
    const desc = state.language === 'ru' ? prop.description_ru : prop.description_en;

    document.getElementById('modalImage').src = prop.image_url || '/favicon.png';
    document.getElementById('modalTitle').textContent = title || '';
    document.getElementById('modalPrice').textContent = convertPrice(prop.price_usd);
    document.getElementById('modalCity').textContent = (state.language === 'ru' ? prop.city_name_ru : prop.city_name_en) || '-';
    document.getElementById('modalType').textContent = (state.language === 'ru' ? prop.type_name_ru : prop.type_name_en) || '-';
    document.getElementById('modalDescription').textContent = desc || '';
    document.getElementById('modalBedrooms').textContent = prop.bedrooms ?? '-';
    document.getElementById('modalBathrooms').textContent = prop.bathrooms ?? '-';
    document.getElementById('modalArea').textContent = prop.area_sqm ?? '-';
    document.getElementById('modalPropertyId').value = id;

    document.getElementById('propertyModal').classList.add('active');
}

function closeModal() {
    document.getElementById('propertyModal').classList.remove('active');
}

// ==================== Заявки (публичные) ====================
async function submitApplication(e) {
    e.preventDefault();

    const rawPid = document.getElementById('modalPropertyId').value;
    const data = {
        property_id: rawPid ? parseInt(rawPid, 10) : null,
        customer_name: document.getElementById('customerName').value.trim(),
        customer_phone: document.getElementById('customerPhone').value.trim(),
        customer_email: document.getElementById('customerEmail').value.trim() || undefined,
        message: document.getElementById('customerMessage').value.trim() || undefined
    };

    try {
        await apiFetch('/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        alert(t('app_sent'));
        closeModal();
        e.target.reset();
    } catch (err) {
        console.error('Ошибка отправки заявки:', err);
        alert(`${t('app_err')}\n${err.message}`);
    }
}

// ==================== Админка: вход ====================
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const full = await res.json().catch(() => null);

        if (res.ok && full && full.token) {
            state.token = full.token;
            state.user = full.user;
            saveSettings();
            // Проверяем, что сервер принимает новый токен (защита от «панель появилась и пропала»):
            const valid = await validateToken();
            if (valid) {
                showAdminPanel();
            } else {
                logout(true);
                alert('Сервер отверг токен авторизации. Скорее всего в .env не задан JWT_SECRET '
                    + '(или он изменился после перезапуска сервера). Задайте постоянный JWT_SECRET в .env и повторите вход.');
            }
        } else if (res.status === 401) {
            alert(`${t('err_login')}${full && full.error ? ': ' + full.error.message : ''}`);
        } else {
            const msg = full && full.error ? (full.error.message || '') : `HTTP ${res.status}`;
            alert(`Ошибка входа: ${msg || t('err_server')}`);
        }
    } catch (err) {
        console.error('Ошибка входа:', err);
        alert(`${t('err_server')}\n${err.message || ''}`);
    }
    document.getElementById('password').value = '';
}

function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAdminData();
}

// Проверка токена на бэкенде до показа панели.
// Если токен недействителен (например, сервер перезапущен с новым JWT_SECRET
// или в .env не задан JWT_SECRET) — сразу показываем форму входа,
// а не панель, которая «исчезает через секунду».
async function validateToken() {
    try {
        await apiFetch('/admin/stats', { headers: authHeaders() });
        return true;
    } catch (err) {
        console.warn('Токен не принят сервером:', err.message);
        return false;
    }
}

async function logout(silent = false) {
    state.token = null;
    state.user = null;
    saveSettings();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    if (!silent) {
        // ничего дополнительного; токен просто удаляется из хранилища
    }
}

function loadAdminData() {
    loadStats();
    loadAdminProperties();
    loadAdminApplications();
    loadRates();
}

async function loadStats() {
    try {
        const stats = await apiFetch('/admin/stats', { headers: authHeaders() });
        document.getElementById('statProperties').textContent = stats.totalProperties ?? 0;
        document.getElementById('statApplications').textContent = stats.totalApplications ?? 0;
        document.getElementById('statNewApps').textContent = stats.newApplications ?? 0;
        document.getElementById('statUsers').textContent = stats.totalUsers ?? 0;
    } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        handleAuthError(err);
    }
}

// ---- Объекты (админ) ----
function propName(p) { return state.language === 'ru' ? p.title_ru : p.title_en; }

function propStatusLabel(s) {
    const map = { active: 'prop_active', sold: 'prop_sold', rented: 'prop_rented' };
    return t(map[s] || s);
}

async function loadAdminProperties() {
    const tbody = document.getElementById('adminPropertiesTable');
    try {
        const props = await apiFetch('/admin/properties', { headers: authHeaders() });
        tbody.innerHTML = props.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${escapeHtml(propName(p))}</td>
                <td>$${Number(p.price_usd).toLocaleString()}</td>
                <td>${getCityName(p.city_id)}</td>
                <td>${propStatusLabel(p.status)}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="startEditProperty(${p.id})">${t('edit')}</button>
                    <select onchange="updatePropStatus(${p.id}, this.value)">
                        <option value="active" ${p.status === 'active' ? 'selected' : ''}>${t('prop_active')}</option>
                        <option value="sold" ${p.status === 'sold' ? 'selected' : ''}>${t('prop_sold')}</option>
                        <option value="rented" ${p.status === 'rented' ? 'selected' : ''}>${t('prop_rented')}</option>
                    </select>
                    <button class="btn btn-sm btn-danger" onclick="deleteProperty(${p.id})">${t('delete')}</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Ошибка загрузки свойств (админ):', err);
        handleAuthError(err);
    }
}

// Быстрое редактирование объекта (цена + названия) — PUT /admin/properties/:id
async function startEditProperty(id) {
    const props = await getCachedAdminProperties();
    const p = props.find(x => x.id === id);
    if (!p) return;

    const titleRu = prompt('Название (RU):', p.title_ru || '');
    if (titleRu === null) return;
    const titleEn = prompt('Название (EN):', p.title_en || '');
    if (titleEn === null) return;
    const input = prompt(`${t('price')} ($) [ID ${id}]:`, p.price_usd);
    if (input === null) return;

    const price = parseFloat(input);
    const payload = { price_usd: price };
    if (titleRu.trim()) payload.title_ru = titleRu.trim();
    if (titleEn.trim()) payload.title_en = titleEn.trim();

    if (isNaN(price) || price < 0 || (!payload.title_ru && !payload.title_en)) {
        alert(t('fill_required'));
        return;
    }

    try {
        await apiFetch(`/admin/properties/${id}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload)
        });
        alert(t('prop_updated'));
        invalidateAdminCache();
        loadAdminProperties();
        loadStats();
        loadProperties();
    } catch (err) {
        console.error('Ошибка обновления объекта:', err);
        handleAuthError(err);
        alert(err.message);
    }
}

async function updatePropStatus(id, status) {
    try {
        await apiFetch(`/admin/properties/${id}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status })
        });
        invalidateAdminCache();
        loadAdminProperties();
        loadProperties();
    } catch (err) {
        console.error('Ошибка смены статуса:', err);
        handleAuthError(err);
    }
}

async function deleteProperty(id) {
    if (!confirm(t('confirm_delete'))) return;
    try {
        await apiFetch(`/admin/properties/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        invalidateAdminCache();
        loadAdminProperties();
        loadStats();
        loadProperties();
    } catch (err) {
        console.error('Ошибка удаления:', err);
        handleAuthError(err);
    }
}

// Кэш списка объектов админа для редактирования
let _adminPropsCache = null;
async function getCachedAdminProperties() {
    if (_adminPropsCache) return _adminPropsCache;
    try {
        _adminPropsCache = await apiFetch('/admin/properties', { headers: authHeaders() });
        return _adminPropsCache;
    } catch (e) { return []; }
}
function invalidateAdminCache() { _adminPropsCache = null; }

// ---- Заявки (админ) ----
function appStatusLabel(s) {
    const map = { new: 'status_new', contacted: 'status_contacted', completed: 'status_completed', cancelled: 'status_cancelled' };
    return t(map[s] || s);
}

async function loadAdminApplications() {
    const tbody = document.getElementById('adminApplicationsTable');
    try {
        const apps = await apiFetch('/admin/applications', { headers: authHeaders() });
        tbody.innerHTML = apps.map(a => `
            <tr>
                <td>${a.id}</td>
                <td>${escapeHtml(a.customer_name)}</td>
                <td>${escapeHtml(a.customer_phone)}</td>
                <td>${escapeHtml(a.customer_email || '-')}</td>
                <td>${escapeHtml((state.language === 'ru' ? a.title_ru : a.title_en) || '-')}</td>
                <td>${escapeHtml(a.message || '-')}</td>
                <td>${appStatusLabel(a.status)}</td>
                <td><input type="text" id="appComment-${a.id}" value="${escapeHtml(a.admin_comment || '')}" style="padding:5px; width:120px;"></td>
                <td>
                    <select onchange="updateAppStatus(${a.id}, this.value)">
                        <option value="new" ${a.status === 'new' ? 'selected' : ''}>${t('status_new')}</option>
                        <option value="contacted" ${a.status === 'contacted' ? 'selected' : ''}>${t('status_contacted')}</option>
                        <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>${t('status_completed')}</option>
                        <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>${t('status_cancelled')}</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Ошибка загрузки заявок (админ):', err);
        handleAuthError(err);
    }
}

async function updateAppStatus(id, status) {
    const commentEl = document.getElementById(`appComment-${id}`);
    const admin_comment = commentEl ? commentEl.value.trim() : undefined;
    try {
        await apiFetch(`/admin/applications/${id}`, {
            method: 'PATCH',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status, admin_comment })
        });
        loadAdminApplications();
        loadStats();
    } catch (err) {
        console.error('Ошибка обновления статуса заявки:', err);
        handleAuthError(err);
    }
}

// ---- Курсы валют ----
async function loadRates() {
    try {
        const rates = await apiFetch('/rates');
        if (rates && typeof rates === 'object') {
            state.rates = { USD: 1, ...rates };
        }
        if (document.getElementById('rateEUR')) {
            document.getElementById('rateEUR').value = state.rates.EUR ?? 0.92;
            document.getElementById('rateEGP').value = state.rates.EGP ?? 47.5;
            document.getElementById('rateRUB').value = state.rates.RUB ?? 92.5;
        }
    } catch (err) {
        console.warn('Не удалось загрузить курсы, используются значения по умолчанию:', err.message);
    }
    // перерисовываем цены с актуальными курсами
    renderProperties(state.properties, 'propertiesGrid');
    loadFeaturedProperties();
}

// Ручное сохранение курсов — PUT /api/rates/:code на бэкенде
async function saveRates(e) {
    e.preventDefault();
    const values = { EUR: parseFloat(document.getElementById('rateEUR').value),
                     EGP: parseFloat(document.getElementById('rateEGP').value),
                     RUB: parseFloat(document.getElementById('rateRUB').value) };

    try {
        for (const [code, rate] of Object.entries(values)) {
            if (isNaN(rate) || rate <= 0) throw new Error(`${t('fill_required')}: ${code}`);
            await apiFetch(`/rates/${code}`, {
                method: 'PUT',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ rate })
            });
        }
        await loadRates();
        alert(t('rates_saved'));
    } catch (err) {
        console.error('Ошибка сохранения курсов:', err);
        handleAuthError(err);
        alert(`${t('rates_err')}: ${err.message}`);
    }
}

// Обновление курсов из внешнего источника (cron-сервис на бэкенде)
async function refreshRatesFromApi() {
    try {
        const data = await apiFetch('/rates/refresh', { method: 'POST', headers: authHeaders() });
        if (data && typeof data === 'object') state.rates = { USD: 1, ...data };
        document.getElementById('rateEUR').value = state.rates.EUR ?? 0.92;
        document.getElementById('rateEGP').value = state.rates.EGP ?? 47.5;
        document.getElementById('rateRUB').value = state.rates.RUB ?? 92.5;
        alert(t('rates_refreshed'));
        renderProperties(state.properties, 'propertiesGrid');
        loadFeaturedProperties();
    } catch (err) {
        console.error('Ошибка обновления курсов:', err);
        handleAuthError(err);
        alert(`${t('rates_err')}: ${err.message}`);
    }
}

// ---- Добавление объекта ----
async function addProperty(e) {
    e.preventDefault();

    const citySel = document.getElementById('propCity');
    const typeSel = document.getElementById('propType');
    if (!citySel.value || !typeSel.value) { alert(t('fill_required')); return; }

    const data = {
        title_ru: document.getElementById('propTitleRu').value.trim(),
        title_en: document.getElementById('propTitleEn').value.trim(),
        description_ru: document.getElementById('propDescRu').value.trim(),
        description_en: document.getElementById('propDescEn').value.trim(),
        price_usd: parseFloat(document.getElementById('propPrice').value),
        city_id: parseInt(citySel.value, 10),
        type_id: parseInt(typeSel.value, 10),
        bedrooms: parseInt(document.getElementById('propBedrooms').value) || 0,
        bathrooms: parseInt(document.getElementById('propBathrooms').value) || 0,
        area_sqm: parseFloat(document.getElementById('propArea').value) || 0,
        image_url: document.getElementById('propImage').value.trim() || '/favicon.png'
    };

    try {
        // Бэкенд ожидает multipart (upload.single('image')) — отправляем FormData
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => fd.append(k, v));

        // Если выбран файл изображения — прикладываем его (field name: image)
        const fileInput = document.getElementById('propImageFile');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            fd.append('image', fileInput.files[0]);
        }

        const res = await fetch(`${API_URL}/admin/properties`, {
            method: 'POST',
            headers: authHeaders(),
            body: fd
        });
        let body = null;
        try { body = await res.json(); } catch (e) { /* noop */ }

        if (res.ok && body && body.success) {
            alert(t('prop_added'));
            e.target.reset();
            invalidateAdminCache();
            loadAdminProperties();
            loadStats();
            loadProperties();
        } else {
            const msg = body && body.error
                ? (body.error.details ? body.error.details.map(d => d.msg).join('; ') : body.error.message)
                : `HTTP ${res.status}`;
            alert(`${t('prop_err')}\n${msg}`);
        }
    } catch (err) {
        console.error('Ошибка добавления объекта:', err);
        handleAuthError(err);
        alert(t('err_server'));
    }
}

function getCityName(cityId) {
    const city = state.cities.find(c => c.id === cityId);
    return city ? escapeHtml(state.language === 'ru' ? city.name_ru : city.name_en) : '-';
}

// ==================== Табы админки ====================
function showAdminTab(tabName, btnEl) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (btnEl) btnEl.classList.add('active');
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) tab.classList.add('active');
}

// ==================== Прочее ====================
// Закрытие модалки по клику вне её
window.onclick = function (event) {
    const modal = document.getElementById('propertyModal');
    if (modal && event.target === modal) {
        closeModal();
    }
};
