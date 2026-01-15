// 1. Обработка формы
const form = document.getElementById('contactForm');
const statusTxt = document.getElementById('form-status');

form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const btn = document.getElementById('submitBtn');
    
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
    }).then(response => {
        if (response.ok) {
            statusTxt.innerHTML = "Успешно! Я свяжусь с вами в ближайшее время.";
            statusTxt.style.color = "#28a745";
            form.reset();
        } else {
            statusTxt.innerHTML = "Ошибка при отправке.";
            statusTxt.style.color = "#dc3545";
        }
    }).catch(() => {
        statusTxt.innerHTML = "Ошибка сети.";
    }).finally(() => {
        btn.disabled = false;
        btn.textContent = 'Отправить сообщение';
    });
});

// 2. Логика кнопки "Наверх" и анимации появления
const topBtn = document.getElementById("scrollTopBtn");

window.addEventListener('scroll', () => {
    // Показ кнопки
    if (window.scrollY > 400) {
        topBtn.classList.add("show");
    } else {
        topBtn.classList.remove("show");
    }

    // Анимация элементов при прокрутке
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            el.classList.add("active");
        }
    });
});

topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// 3. Темная тема
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    }
});
// Логика аккордеона FAQ
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const parent = question.parentElement;
        
        // Закрыть другие открытые вопросы (опционально)
        /*
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== parent) item.classList.remove('active');
        });
        */
        
        parent.classList.toggle('active');
    });
});