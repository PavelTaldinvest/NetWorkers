const cron = require('node-cron');
const pool = require('../config/db');

/**
 * Обновление курсов валют из открытого API
 * Запускается раз в сутки в 00:00
 */
async function updateCurrencyRates() {
  try {
    console.log('🔄 Обновление курсов валют...');
    
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error('Не удалось получить курсы валют');
    }
    
    const rates = data.rates;
    const now = new Date();
    
    // USD всегда = 1
    await pool.query(
      `INSERT INTO currency_rates (code, rate, updated_at) 
       VALUES ('USD', 1, $1) 
       ON CONFLICT (code) DO UPDATE SET rate = 1, updated_at = $1`,
      [now]
    );
    
    // Обновляем остальные валюты
    const currenciesToUpdate = ['EUR', 'EGP', 'RUB'];
    
    for (const code of currenciesToUpdate) {
      if (rates[code]) {
        // Конвертируем: если 1 USD = X EUR, то 1 EUR = 1/X USD
        // Но нам нужно хранить курс относительно USD, так что оставляем как есть
        const rate = 1 / rates[code]; // Инвертируем для нашей логики
        
        await pool.query(
          `INSERT INTO currency_rates (code, rate, updated_at) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (code) DO UPDATE SET rate = $2, updated_at = $3`,
          [code, rate, now]
        );
        
        console.log(`✓ ${code}: ${rate.toFixed(6)}`);
      }
    }
    
    console.log('✅ Курсы валют успешно обновлены');
  } catch (error) {
    console.error('❌ Ошибка обновления курсов валют:', error.message);
  }
}

/**
 * Инициализация cron-задач
 */
function initCronJobs() {
  // Запуск каждый день в полночь
  cron.schedule('0 0 * * *', () => {
    updateCurrencyRates();
  }, {
    timezone: 'UTC'
  });
  
  console.log('📅 Cron-задачи инициализированы (обновление курсов в 00:00 UTC)');
}

module.exports = { initCronJobs, updateCurrencyRates };
