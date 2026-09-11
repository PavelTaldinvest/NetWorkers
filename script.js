// Конфигурация API
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

// Состояние приложения
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

// Переводы
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
        status: 'Статус',
        save_rates: 'Сохранить курсы',
        add_property: 'Добавить объект',
        request_info: 'Запросить информацию',
        send_request: 'Отправить заявку',
        edit: 'Ред.',
        delete: 'Удалить',
        view: 'Просмотр',
        no_properties: 'Нет объектов',
        confirm_delete: 'Вы уверены?'
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
        status: 'Status',
        save_rates: 'Save Rates',
        add_property: 'Add Property',
        request_info: 'Request Information',
        send_request: 'Send Request',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        no_properties: 'No properties',
        confirm_delete: 'Are you sure?'
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initNavigation();
    initThemeToggle();
    initLanguageSelect();
    initCurrencySelect();
    loadProperties();
    loadCitiesAndTypes();
    updateTranslations();
});

// Загрузка настроек из localStorage
function loadSettings() {
    const saved = localStorage.getItem('egyptEstateSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        state.language = settings.language || 'ru';
        state.currency = settings.currency || 'USD';
        state.theme = settings.theme || 'light';
        state.token = settings.token;
        state.user = settings.user;
    }
    
    applyTheme(state.theme);
    document.getElementById('languageSelect').value = state.language;
    document.getElementById('currencySelect').value = state.currency;
    
    if (state.token) {
        showAdminPanel();
    }
}

// Сохранение настроек
function saveSettings() {
    localStorage.setItem('egyptEstateSettings', JSON.stringify({
        language: state.language,
        currency: state.currency,
        theme: state.theme,
        token: state.token,
        user: state.user
    }));
}

// Навигация
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(`${pageName}-page`).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
    
    if (pageName === 'catalog') {
        loadProperties();
    } else if (pageName === 'home') {
        loadFeaturedProperties();
    }
}

// Тема
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
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Язык
function initLanguageSelect() {
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        state.language = e.target.value;
        updateTranslations();
        saveSettings();
        loadProperties();
    });
}

function updateTranslations() {
    const t = translations[state.language];
    
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.dataset.langPlaceholder;
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
}

// Валюта
function initCurrencySelect() {
    document.getElementById('currencySelect').addEventListener('change', (e) => {
        state.currency = e.target.value;
        saveSettings();
        loadProperties();
    });
}

function convertPrice(priceUSD) {
    const rate = state.rates[state.currency] || 1;
    const converted = priceUSD * rate;
    
    const symbols = { USD: '$', EUR: '€', EGP: '£', RUB: '₽' };
    return `${symbols[state.currency] || state.currency} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// Загрузка данных
async function loadProperties() {
    try {
        const params = new URLSearchParams();
        if (document.getElementById('cityFilter')?.value) params.append('city', document.getElementById('cityFilter').value);
        if (document.getElementById('typeFilter')?.value) params.append('type', document.getElementById('typeFilter').value);
        if (document.getElementById('minPrice')?.value) params.append('minPrice', document.getElementById('minPrice').value);
        if (document.getElementById('maxPrice')?.value) params.append('maxPrice', document.getElementById('maxPrice').value);
        if (document.getElementById('searchInput')?.value) params.append('search', document.getElementById('searchInput').value);
        
        const response = await fetch(`${API_URL}/properties?${params}`);
        state.properties = await response.json();
        
        renderProperties(state.properties, 'propertiesGrid');
        
        if (document.getElementById('home-page').classList.contains('active')) {
            loadFeaturedProperties();
        }
    } catch (err) {
        console.error('Ошибка загрузки свойств:', err);
    }
}

function loadFeaturedProperties() {
    const featured = state.properties.slice(0, 3);
    renderProperties(featured, 'featuredProperties');
}

function renderProperties(properties, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (properties.length === 0) {
        container.innerHTML = `<p style="text-align:center;padding:40px;">${translations[state.language].no_properties}</p>`;
        return;
    }
    
    container.innerHTML = properties.map(prop => {
        const title = state.language === 'ru' ? prop.title_ru : prop.title_en;
        return `
            <div class="property-card" onclick="openPropertyModal(${prop.id})">
                <img src="${prop.image_url || 'https://via.placeholder.com/500'}" alt="${title}">
                <div class="property-card-content">
                    <h3 class="property-card-title">${title}</h3>
                    <p class="property-card-price">${convertPrice(prop.price_usd)}</p>
                    <div class="property-card-details">
                        <span><i class="fas fa-bed"></i> ${prop.bedrooms || '-'}</span>
                        <span><i class="fas fa-bath"></i> ${prop.bathrooms || '-'}</span>
                        <span><i class="fas fa-ruler-combined"></i> ${prop.area_sqm || '-'} м²</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadCitiesAndTypes() {
    try {
        const [citiesRes, typesRes] = await Promise.all([
            fetch(`${API_URL}/cities`),
            fetch(`${API_URL}/types`)
        ]);
        
        state.cities = await citiesRes.json();
        state.types = await typesRes.json();
        
        populateSelects();
    } catch (err) {
        // Демо данные
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
        populateSelects();
    }
}

function populateSelects() {
    const cityFilter = document.getElementById('cityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const propCity = document.getElementById('propCity');
    const propType = document.getElementById('propType');
    
    const getName = (item) => state.language === 'ru' ? item.name_ru : item.name_en;
    
    if (cityFilter) {
        cityFilter.innerHTML = '<option value="" data-lang-key="all_cities">' + translations[state.language].all_cities + '</option>' +
            state.cities.map(c => `<option value="${c.id}">${getName(c)}</option>`).join('');
    }
    
    if (typeFilter) {
        typeFilter.innerHTML = '<option value="" data-lang-key="all_types">' + translations[state.language].all_types + '</option>' +
            state.types.map(t => `<option value="${t.id}">${getName(t)}</option>`).join('');
    }
    
    if (propCity) {
        propCity.innerHTML = '<option value="">Город / City</option>' +
            state.cities.map(c => `<option value="${c.id}">${getName(c)}</option>`).join('');
    }
    
    if (propType) {
        propType.innerHTML = '<option value="">Тип / Type</option>' +
            state.types.map(t => `<option value="${t.id}">${getName(t)}</option>`).join('');
    }
}

function applyFilters() {
    loadProperties();
}

// Модалка
function openPropertyModal(id) {
    const prop = state.properties.find(p => p.id === id);
    if (!prop) return;
    
    const title = state.language === 'ru' ? prop.title_ru : prop.title_en;
    const desc = state.language === 'ru' ? prop.description_ru : prop.description_en;
    
    document.getElementById('modalImage').src = prop.image_url || 'https://via.placeholder.com/500';
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalPrice').textContent = convertPrice(prop.price_usd);
    document.getElementById('modalDescription').textContent = desc || '';
    document.getElementById('modalBedrooms').textContent = prop.bedrooms || '-';
    document.getElementById('modalBathrooms').textContent = prop.bathrooms || '-';
    document.getElementById('modalArea').textContent = prop.area_sqm || '-';
    document.getElementById('modalPropertyId').value = id;
    
    document.getElementById('propertyModal').classList.add('active');
}

function closeModal() {
    document.getElementById('propertyModal').classList.remove('active');
}

// Заявка
async function submitApplication(e) {
    e.preventDefault();
    
    const data = {
        property_id: document.getElementById('modalPropertyId').value,
        customer_name: document.getElementById('customerName').value,
        customer_phone: document.getElementById('customerPhone').value,
        customer_email: document.getElementById('customerEmail').value,
        message: document.getElementById('customerMessage').value
    };
    
    try {
        const response = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert(state.language === 'ru' ? 'Заявка отправлена!' : 'Request sent!');
            closeModal();
            e.target.reset();
        }
    } catch (err) {
        console.error('Ошибка отправки заявки:', err);
        alert(state.language === 'ru' ? 'Ошибка отправки заявки' : 'Error sending request');
    }
}

// Админка
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            state.token = data.token;
            state.user = data.user;
            saveSettings();
            showAdminPanel();
            loadAdminData();
        } else {
            alert('Неверные учётные данные');
        }
    })
    .catch(err => {
        console.error('Ошибка входа:', err);
        alert('Ошибка подключения к серверу');
    });
}

function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAdminData();
}

function logout() {
    state.token = null;
    state.user = null;
    saveSettings();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function loadAdminData() {
    loadStats();
    loadAdminProperties();
    loadAdminApplications();
    loadRates();
}

async function loadStats() {
    try {
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const stats = await res.json();
        
        document.getElementById('statProperties').textContent = stats.totalProperties || 0;
        document.getElementById('statApplications').textContent = stats.totalApplications || 0;
        document.getElementById('statNewApps').textContent = stats.newApplications || 0;
        document.getElementById('statUsers').textContent = stats.totalUsers || 0;
    } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
    }
}

async function loadAdminProperties() {
    try {
        const res = await fetch(`${API_URL}/admin/properties`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const props = await res.json();
        
        const tbody = document.getElementById('adminPropertiesTable');
        tbody.innerHTML = props.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${state.language === 'ru' ? p.title_ru : p.title_en}</td>
                <td>$${p.price_usd.toLocaleString()}</td>
                <td>${getCityName(p.city_id)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteProperty(${p.id})">${translations[state.language].delete}</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Ошибка загрузки свойств:', err);
    }
}

async function loadAdminApplications() {
    try {
        const res = await fetch(`${API_URL}/admin/applications`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const apps = await res.json();
        
        const tbody = document.getElementById('adminApplicationsTable');
        tbody.innerHTML = apps.map(a => `
            <tr>
                <td>${a.id}</td>
                <td>${a.customer_name}</td>
                <td>${a.customer_phone}</td>
                <td>${a.title_ru || a.title_en || '-'}</td>
                <td>${a.status}</td>
                <td>
                    <select onchange="updateAppStatus(${a.id}, this.value)" style="padding:5px;">
                        <option value="new" ${a.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${a.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Ошибка загрузки заявок:', err);
    }
}

async function updateAppStatus(id, status) {
    try {
        await fetch(`${API_URL}/admin/applications/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        loadAdminApplications();
    } catch (err) {
        console.error('Ошибка обновления статуса:', err);
    }
}

async function loadRates() {
    try {
        const res = await fetch(`${API_URL}/rates`);
        state.rates = await res.json();
        
        document.getElementById('rateEUR').value = state.rates.EUR || 0.92;
        document.getElementById('rateEGP').value = state.rates.EGP || 47.5;
        document.getElementById('rateRUB').value = state.rates.RUB || 92.5;
    } catch (err) {
        console.error('Ошибка загрузки курсов:', err);
    }
}

function updateRates(e) {
    e.preventDefault();
    
    const rates = {
        USD: 1,
        EUR: parseFloat(document.getElementById('rateEUR').value),
        EGP: parseFloat(document.getElementById('rateEGP').value),
        RUB: parseFloat(document.getElementById('rateRUB').value)
    };
    
    fetch(`${API_URL}/admin/rates`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rates)
    })
    .then(res => res.json())
    .then(() => {
        state.rates = rates;
        alert('Курсы обновлены!');
        loadProperties();
    })
    .catch(err => {
        console.error('Ошибка обновления курсов:', err);
        alert('Ошибка обновления курсов');
    });
}

function showAdminTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

async function addProperty(e) {
    e.preventDefault();
    
    const data = {
        title_ru: document.getElementById('propTitleRu').value,
        title_en: document.getElementById('propTitleEn').value,
        description_ru: document.getElementById('propDescRu').value,
        description_en: document.getElementById('propDescEn').value,
        price_usd: parseFloat(document.getElementById('propPrice').value),
        city_id: parseInt(document.getElementById('propCity').value),
        type_id: parseInt(document.getElementById('propType').value),
        bedrooms: parseInt(document.getElementById('propBedrooms').value) || 0,
        bathrooms: parseInt(document.getElementById('propBathrooms').value) || 0,
        area_sqm: parseFloat(document.getElementById('propArea').value) || 0,
        image_url: document.getElementById('propImage').value || 'https://via.placeholder.com/500'
    };
    
    try {
        const res = await fetch(`${API_URL}/admin/properties`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            alert('Объект добавлен!');
            e.target.reset();
            loadAdminProperties();
            loadStats();
        }
    } catch (err) {
        console.error('Ошибка добавления объекта:', err);
        alert('Ошибка добавления объекта');
    }
}

async function deleteProperty(id) {
    if (!confirm(translations[state.language].confirm_delete)) return;
    
    try {
        await fetch(`${API_URL}/admin/properties/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        loadAdminProperties();
        loadStats();
    } catch (err) {
        console.error('Ошибка удаления:', err);
    }
}

function getCityName(cityId) {
    const city = state.cities.find(c => c.id === cityId);
    return city ? (state.language === 'ru' ? city.name_ru : city.name_en) : '-';
}

// Закрытие модалки по клику вне
window.onclick = function(event) {
    const modal = document.getElementById('propertyModal');
    if (event.target === modal) {
        closeModal();
    }
}
