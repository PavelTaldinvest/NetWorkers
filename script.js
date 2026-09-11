// Egypt Estate - Real Estate Website Script

// === STATE & DATA ===
let currentLang = 'ru';
let currentTheme = 'light';
let currentCurrency = 'USD';
let isAdmin = false;

const defaultRates = { USD: 1, EUR: 0.92, EGP: 48.5, RUB: 92 };
let currencyRates = JSON.parse(localStorage.getItem('egyptEstate_rates')) || defaultRates;

const defaultProperties = [
    { id: 1, title: "Luxury Villa in Hurghada", city: "Hurghada", type: "Villa", price: 350000, beds: 4, area: 280, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600", description: "Stunning villa with private pool and sea view" },
    { id: 2, title: "Sharm Beachfront Apartment", city: "Sharm", type: "Apartment", price: 180000, beds: 2, area: 95, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600", description: "Modern apartment directly on the beach" },
    { id: 3, title: "Cairo Downtown Penthouse", city: "Cairo", type: "Apartment", price: 220000, beds: 3, area: 150, image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600", description: "Luxury penthouse in the heart of Cairo" },
    { id: 4, title: "Hurghada Marina Townhouse", city: "Hurghada", type: "Townhouse", price: 280000, beds: 3, area: 180, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600", description: "Spacious townhouse near marina" },
    { id: 5, title: "Sharm Desert Villa", city: "Sharm", type: "Villa", price: 420000, beds: 5, area: 350, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600", description: "Exclusive villa with mountain views" },
    { id: 6, title: "New Cairo Compound House", city: "Cairo", type: "House", price: 310000, beds: 4, area: 220, image: "https://images.unsplash.com/photo-1580587771527-78dd89297b6f?w=600", description: "Family home in secure compound" }
];

let properties = JSON.parse(localStorage.getItem('egyptEstate_properties')) || defaultProperties;
let leads = JSON.parse(localStorage.getItem('egyptEstate_leads')) || [];

// === TRANSLATIONS ===
const translations = {
    ru: {
        'nav.home': 'Главная', 'nav.catalog': 'Каталог', 'nav.admin': 'Админка',
        'hero.title': 'Ваш дом у Красного моря', 'hero.subtitle': 'Лучшая недвижимость в Хургаде и Шарм-эль-Шейхе', 'hero.btn': 'Смотреть объекты',
        'features.title': 'Почему мы?', 'features.legal.title': 'Юридическая чистота', 'features.legal.desc': 'Полное сопровождение сделки',
        'features.keys.title': 'Передача ключей', 'features.keys.desc': 'Помощь в заселении',
        'features.invest.title': 'Инвестиции', 'features.invest.desc': 'Высокий рост стоимости',
        'filters.search': 'Поиск...', 'filters.city.all': 'Все города', 'filters.type.all': 'Все типы',
        'filters.sort.newest': 'Новые', 'filters.sort.price-asc': 'Цена ↑', 'filters.sort.price-desc': 'Цена ↓',
        'admin.login.title': 'Вход для администратора', 'admin.login.btn': 'Войти', 'admin.dashboard.title': 'Панель управления',
        'admin.logout': 'Выйти', 'admin.tabs.properties': 'Объекты', 'admin.tabs.leads': 'Заявки', 'admin.tabs.rates': 'Курсы',
        'admin.props.add': 'Добавить объект', 'admin.save': 'Сохранить',
        'modal.contact.title': 'Оставить заявку', 'modal.contact.btn': 'Отправить заявку',
        'city.Hurghada': 'Хургада', 'city.Sharm': 'Шарм-эль-Шейх', 'city.Cairo': 'Каир',
        'type.Apartment': 'Апартаменты', 'type.Villa': 'Вилла', 'type.Townhouse': 'Таунхаус', 'type.House': 'Дом'
    },
    en: {
        'nav.home': 'Home', 'nav.catalog': 'Catalog', 'nav.admin': 'Admin',
        'hero.title': 'Your Home by the Red Sea', 'hero.subtitle': 'Best properties in Hurghada and Sharm el-Sheikh', 'hero.btn': 'View Properties',
        'features.title': 'Why Us?', 'features.legal.title': 'Legal Purity', 'features.legal.desc': 'Full transaction support',
        'features.keys.title': 'Key Handover', 'features.keys.desc': 'Move-in assistance',
        'features.invest.title': 'Investments', 'features.invest.desc': 'High value growth',
        'filters.search': 'Search...', 'filters.city.all': 'All Cities', 'filters.type.all': 'All Types',
        'filters.sort.newest': 'Newest', 'filters.sort.price-asc': 'Price ↑', 'filters.sort.price-desc': 'Price ↓',
        'admin.login.title': 'Admin Login', 'admin.login.btn': 'Login', 'admin.dashboard.title': 'Dashboard',
        'admin.logout': 'Logout', 'admin.tabs.properties': 'Properties', 'admin.tabs.leads': 'Leads', 'admin.tabs.rates': 'Rates',
        'admin.props.add': 'Add Property', 'admin.save': 'Save',
        'modal.contact.title': 'Submit Inquiry', 'modal.contact.btn': 'Send Inquiry',
        'city.Hurghada': 'Hurghada', 'city.Sharm': 'Sharm el-Sheikh', 'city.Cairo': 'Cairo',
        'type.Apartment': 'Apartment', 'type.Villa': 'Villa', 'type.Townhouse': 'Townhouse', 'type.House': 'House'
    }
};

// === DOM ELEMENTS ===
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const currencySelect = document.getElementById('currency-select');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const propertiesGrid = document.getElementById('properties-grid');
const searchInput = document.getElementById('search-input');
const filterCity = document.getElementById('filter-city');
const filterType = document.getElementById('filter-type');
const filterSort = document.getElementById('filter-sort');
const propertyModal = document.getElementById('property-modal');
const editorModal = document.getElementById('property-editor-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const adminLogin = document.getElementById('admin-login');
const loginForm = document.getElementById('login-form');
const adminDashboard = document.getElementById('admin-dashboard');
const logoutBtn = document.getElementById('logout-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const ratesForm = document.getElementById('rates-form');
const propertyForm = document.getElementById('property-form');
const leadForm = document.getElementById('lead-form');

// === INITIALIZATION ===
function init() {
    loadSettings();
    applyTheme();
    applyLanguage();
    renderProperties();
    setupEventListeners();
}

function loadSettings() {
    const savedLang = localStorage.getItem('egyptEstate_lang');
    const savedTheme = localStorage.getItem('egyptEstate_theme');
    const savedCurrency = localStorage.getItem('egyptEstate_currency');
    const savedAdmin = localStorage.getItem('egyptEstate_admin');
    
    if (savedLang) currentLang = savedLang;
    if (savedTheme) currentTheme = savedTheme;
    if (savedCurrency) currentCurrency = savedCurrency;
    if (savedAdmin === 'true') isAdmin = true;
    
    currencySelect.value = currentCurrency;
}

// === THEME & LANGUAGE ===
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('egyptEstate_theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    themeToggle.innerHTML = currentTheme === 'dark' 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
}

function toggleLanguage() {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    localStorage.setItem('egyptEstate_lang', currentLang);
    applyLanguage();
}

function applyLanguage() {
    langToggle.querySelector('.lang-flag').textContent = currentLang === 'ru' ? '🇷🇺' : '🇬🇧';
    document.documentElement.lang = currentLang;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });
    
    updateCityOptions();
    updateTypeOptions();
}

function updateCityOptions() {
    const citySelects = [filterCity, document.getElementById('edit-city')];
    citySelects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = `<option value="">${translations[currentLang]['filters.city.all']}</option>`;
        [['Hurghada', 'city.Hurghada'], ['Sharm', 'city.Sharm'], ['Cairo', 'city.Cairo']].forEach(([val, key]) => {
            select.innerHTML += `<option value="${val}">${translations[currentLang][key]}</option>`;
        });
        select.value = currentValue;
    });
}

function updateTypeOptions() {
    const typeSelects = [filterType, document.getElementById('edit-type')];
    typeSelects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = `<option value="">${translations[currentLang]['filters.type.all']}</option>`;
        [['Apartment', 'type.Apartment'], ['Villa', 'type.Villa'], ['Townhouse', 'type.Townhouse'], ['House', 'type.House']].forEach(([val, key]) => {
            select.innerHTML += `<option value="${val}">${translations[currentLang][key]}</option>`;
        });
        select.value = currentValue;
    });
}

function convertPrice(priceUSD) {
    return (priceUSD * currencyRates[currentCurrency]).toFixed(0);
}

// === NAVIGATION ===
function navigateTo(pageName) {
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    document.getElementById(`${pageName}-page`).classList.add('active');
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    if (pageName === 'catalog') renderProperties();
    if (pageName === 'admin') checkAdminStatus();
    
    // Close mobile menu
    document.querySelector('.nav-menu').classList.remove('mobile-open');
}

// === PROPERTY RENDERING ===
function renderProperties() {
    const searchTerm = searchInput.value.toLowerCase();
    const cityFilter = filterCity.value;
    const typeFilter = filterType.value;
    const sortMode = filterSort.value;
    
    let filtered = properties.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm) || 
                             p.description.toLowerCase().includes(searchTerm);
        const matchesCity = !cityFilter || p.city === cityFilter;
        const matchesType = !typeFilter || p.type === typeFilter;
        return matchesSearch && matchesCity && matchesType;
    });
    
    if (sortMode === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortMode === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => b.id - a.id);
    
    if (filtered.length === 0) {
        propertiesGrid.innerHTML = `<div class="no-results">${currentLang === 'ru' ? 'Ничего не найдено' : 'No results found'}</div>`;
        return;
    }
    
    propertiesGrid.innerHTML = filtered.map(p => `
        <div class="property-card" onclick="openPropertyModal(${p.id})">
            <div class="property-image">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
                <span class="property-badge">${translations[currentLang]['type.' + p.type] || p.type}</span>
            </div>
            <div class="property-info">
                <h3>${p.title}</h3>
                <p class="property-location"><i class="fa-solid fa-location-dot"></i> ${translations[currentLang]['city.' + p.city] || p.city}</p>
                <div class="property-features">
                    <span><i class="fa-solid fa-bed"></i> ${p.beds}</span>
                    <span><i class="fa-solid fa-ruler-combined"></i> ${p.area} м²</span>
                </div>
                <div class="property-price">${convertPrice(p.price)} ${currentCurrency}</div>
            </div>
        </div>
    `).join('');
}

// === MODALS ===
function openPropertyModal(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    document.getElementById('modal-img').src = property.image;
    document.getElementById('modal-img').onerror = function() { this.src = 'https://via.placeholder.com/600x400?text=No+Image'; };
    document.getElementById('modal-title').textContent = property.title;
    document.getElementById('modal-price').textContent = `${convertPrice(property.price)} ${currentCurrency}`;
    document.getElementById('modal-location').querySelector('span').textContent = translations[currentLang]['city.' + property.city] || property.city;
    document.getElementById('modal-desc').textContent = property.description;
    document.getElementById('modal-beds').textContent = property.beds;
    document.getElementById('modal-area').textContent = property.area;
    document.getElementById('lead-property-id').value = property.id;
    
    propertyModal.classList.add('active');
}

function closePropertyModal() {
    propertyModal.classList.remove('active');
    editorModal.classList.remove('active');
}

function openPropertyModalEditor(id = null) {
    const form = document.getElementById('property-form');
    form.reset();
    
    if (id) {
        const property = properties.find(p => p.id === id);
        document.getElementById('editor-title').textContent = currentLang === 'ru' ? 'Редактировать объект' : 'Edit Property';
        document.getElementById('edit-id').value = property.id;
        document.getElementById('edit-title').value = property.title;
        document.getElementById('edit-city').value = property.city;
        document.getElementById('edit-type').value = property.type;
        document.getElementById('edit-price').value = property.price;
        document.getElementById('edit-beds').value = property.beds;
        document.getElementById('edit-area').value = property.area;
        document.getElementById('edit-image').value = property.image;
        document.getElementById('edit-desc').value = property.description;
    } else {
        document.getElementById('editor-title').textContent = currentLang === 'ru' ? 'Добавить объект' : 'Add Property';
        document.getElementById('edit-id').value = '';
    }
    
    editorModal.classList.add('active');
}

// === ADMIN PANEL ===
function checkAdminStatus() {
    if (isAdmin) {
        loginForm.style.display = 'none';
        adminDashboard.style.display = 'block';
        renderAdminProperties();
        renderAdminLeads();
        loadRates();
    } else {
        loginForm.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
}

function login(username, password) {
    if (username === 'admin' && password === 'admin') {
        isAdmin = true;
        localStorage.setItem('egyptEstate_admin', 'true');
        checkAdminStatus();
        showToast(currentLang === 'ru' ? 'Вход выполнен' : 'Logged in', 'success');
    } else {
        showToast(currentLang === 'ru' ? 'Неверные данные' : 'Invalid credentials', 'error');
    }
}

function logout() {
    isAdmin = false;
    localStorage.removeItem('egyptEstate_admin');
    checkAdminStatus();
    showToast(currentLang === 'ru' ? 'Выход выполнен' : 'Logged out', 'success');
}

function renderAdminProperties() {
    const tbody = document.getElementById('admin-properties-list');
    tbody.innerHTML = properties.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.image}" style="width:50px;height:35px;object-fit:cover;border-radius:4px;" onerror="this.src='https://via.placeholder.com/50x35'"></td>
            <td>${p.title}</td>
            <td>$${p.price.toLocaleString()}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="openPropertyModalEditor(${p.id})"><i class="fa-solid fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteProperty(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderAdminLeads() {
    const tbody = document.getElementById('admin-leads-list');
    if (leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">${currentLang === 'ru' ? 'Нет заявок' : 'No leads'}</td></tr>`;
        return;
    }
    tbody.innerHTML = leads.map(l => {
        const property = properties.find(p => p.id == l.propertyId);
        return `
            <tr>
                <td>${new Date(l.date).toLocaleDateString()}</td>
                <td>${l.name}</td>
                <td>${l.phone}</td>
                <td>${property ? property.title : 'Unknown'}</td>
                <td><span class="status-badge">${l.status || 'New'}</span></td>
            </tr>
        `;
    }).join('');
}

function deleteProperty(id) {
    if (confirm(currentLang === 'ru' ? 'Удалить объект?' : 'Delete property?')) {
        properties = properties.filter(p => p.id !== id);
        localStorage.setItem('egyptEstate_properties', JSON.stringify(properties));
        renderAdminProperties();
        showToast(currentLang === 'ru' ? 'Удалено' : 'Deleted', 'success');
    }
}

function saveProperty(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const newProperty = {
        id: id ? parseInt(id) : Date.now(),
        title: document.getElementById('edit-title').value,
        city: document.getElementById('edit-city').value,
        type: document.getElementById('edit-type').value,
        price: parseFloat(document.getElementById('edit-price').value),
        beds: parseInt(document.getElementById('edit-beds').value) || 0,
        area: parseInt(document.getElementById('edit-area').value) || 0,
        image: document.getElementById('edit-image').value || 'https://via.placeholder.com/600x400',
        description: document.getElementById('edit-desc').value
    };
    
    if (id) {
        const index = properties.findIndex(p => p.id == id);
        properties[index] = newProperty;
    } else {
        properties.push(newProperty);
    }
    
    localStorage.setItem('egyptEstate_properties', JSON.stringify(properties));
    closePropertyModal();
    renderAdminProperties();
    showToast(currentLang === 'ru' ? 'Сохранено' : 'Saved', 'success');
}

function loadRates() {
    document.getElementById('rate-eur').value = currencyRates.EUR;
    document.getElementById('rate-egp').value = currencyRates.EGP;
    document.getElementById('rate-rub').value = currencyRates.RUB;
}

function saveRates(e) {
    e.preventDefault();
    currencyRates = {
        USD: 1,
        EUR: parseFloat(document.getElementById('rate-eur').value),
        EGP: parseFloat(document.getElementById('rate-egp').value),
        RUB: parseFloat(document.getElementById('rate-rub').value)
    };
    localStorage.setItem('egyptEstate_rates', JSON.stringify(currencyRates));
    showToast(currentLang === 'ru' ? 'Курсы сохранены' : 'Rates saved', 'success');
    renderProperties();
}

// === LEADS ===
function submitLead(e) {
    e.preventDefault();
    const newLead = {
        id: Date.now(),
        date: new Date().toISOString(),
        name: document.getElementById('lead-name').value,
        phone: document.getElementById('lead-phone').value,
        propertyId: document.getElementById('lead-property-id').value,
        status: 'New'
    };
    
    leads.push(newLead);
    localStorage.setItem('egyptEstate_leads', JSON.stringify(leads));
    
    closePropertyModal();
    showToast(currentLang === 'ru' ? 'Заявка отправлена!' : 'Inquiry sent!', 'success');
    renderAdminLeads();
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    langToggle.addEventListener('click', toggleLanguage);
    currencySelect.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        localStorage.setItem('egyptEstate_currency', currentCurrency);
        renderProperties();
    });
    
    mobileMenuBtn.addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('mobile-open');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });
    
    searchInput.addEventListener('input', renderProperties);
    filterCity.addEventListener('change', renderProperties);
    filterType.addEventListener('change', renderProperties);
    filterSort.addEventListener('change', renderProperties);
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closePropertyModal);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === propertyModal) closePropertyModal();
        if (e.target === editorModal) closePropertyModal();
    });
    
    adminLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        login(document.getElementById('admin-user').value, document.getElementById('admin-pass').value);
    });
    
    logoutBtn.addEventListener('click', logout);
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });
    
    ratesForm.addEventListener('submit', saveRates);
    propertyForm.addEventListener('submit', saveProperty);
    leadForm.addEventListener('submit', submitLead);
    
    // Global function for inline handlers
    window.navigateTo = navigateTo;
    window.openPropertyModal = openPropertyModal;
    window.closePropertyModal = closePropertyModal;
    window.openPropertyModalEditor = openPropertyModalEditor;
    window.deleteProperty = deleteProperty;
}

// === UTILITIES ===
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
