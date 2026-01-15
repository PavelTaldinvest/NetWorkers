const form = document.getElementById('contactForm');
const statusTxt = document.getElementById('form-status');

form.addEventListener('submit', async function(event) {
    event.preventDefault(); // Останавливаем стандартную перезагрузку страницы
    
    // Получаем данные из формы
    const data = new FormData(event.target);
    
    // Делаем кнопку неактивной на время отправки
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    // Отправляем данные на Formspree
    fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            statusTxt.innerHTML = "Спасибо! Ваше сообщение успешно отправлено.";
            statusTxt.style.color = "green";
            form.reset(); // Очищаем поля
        } else {
            response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                    statusTxt.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                } else {
                    statusTxt.innerHTML = "Упс! Возникла проблема при отправке.";
                }
                statusTxt.style.color = "red";
            })
        }
    }).catch(error => {
        statusTxt.innerHTML = "Ошибка сети. Попробуйте позже.";
        statusTxt.style.color = "red";
    }).finally(() => {
        // Возвращаем кнопку в исходное состояние
        btn.disabled = false;
        btn.textContent = 'Отправить';
    });
});
const topBtn = document.getElementById("scrollTopBtn");

// Показываем кнопку при прокрутке вниз на 300px
if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    topBtn.style.display = "block";
    topBtn.style.opacity = "1";
} else {
    topBtn.style.opacity = "0";
    setTimeout(() => { if(topBtn.style.opacity === "0") topBtn.style.display = "none"; }, 300);
}

// При клике плавно возвращаемся наверх
topBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});