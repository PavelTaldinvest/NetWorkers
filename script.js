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