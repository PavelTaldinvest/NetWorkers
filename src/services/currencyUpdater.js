const cron = require('node-cron');
const pool = require('../config/db');
const { CURRENCY_CODES } = require('../utils/currency');

/**
 * Обновление курсов валют из открытого API (open.er-api.com).
 * Конвенция хранения: rate = сколько EGP стоит 1 единица валюты.
 * API возвращает rates относительно USD: rates[X] = X за 1 USD,
 * поэтому итоговый курс = rates.EGP / rates[X]. Инверсии в других
 * местах кода больше не нужны.
 * Запускается раз в сутки в 00:00 и по запросу администратора.
 */
async function updateCurrencyRates() {
  console.log('🔄 Обновление курсов валют...');

  const response = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!response.ok) {
    throw new Error(`Внешний API вернул статус ${response.status}`);
  }
  const data = await response.json();

  if (data.result !== 'success' || !data.rates || !data.rates.EGP) {
    throw new Error('Не удалось получить курсы валют');
  }

  const rates = data.rates;
  const egpPerUsd = rates.EGP;
  const now = new Date();

  // Транзакция: либо обновлены все курсы, либо ни одного
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const code of CURRENCY_CODES) {
      let rateEgp;
      if (code === 'EGP') {
        rateEgp = 1;
      } else if (code === 'USD') {
        rateEgp = egpPerUsd;
      } else {
        if (!rates[code]) continue; // источник не отдал эту валюту
        rateEgp = egpPerUsd / rates[code];
      }

      await client.query(
        `INSERT INTO currency_rates (code, rate, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET rate = $2, updated_at = $3`,
        [code, rateEgp.toFixed(4), now]
      );
      console.log(`✓ ${code}: ${rateEgp.toFixed(4)} EGP`);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log('✅ Курсы валют успешно обновлены');
}

/**
 * Инициализация cron-задач
 */
function initCronJobs() {
  // Запуск каждый день в полночь
  cron.schedule('0 0 * * *', () => {
    // Ошибка внешнего API не должна ронять процесс
    updateCurrencyRates().catch((error) => {
      console.error('❌ Ошибка обновления курсов валют:', error.message);
    });
  }, {
    timezone: 'UTC'
  });

  console.log('📅 Cron-задачи инициализированы (обновление курсов в 00:00 UTC)');
}

module.exports = { initCronJobs, updateCurrencyRates };
