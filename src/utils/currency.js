// Единая конвенция хранения курсов валют:
// rate = сколько EGP стоит 1 единица данной валюты.
//   USD: 47.50  (1 USD = 47.50 EGP)
//   EUR: 51.63  (1 EUR = 51.63 EGP)
//   RUB: 0.52   (1 RUB = 0.52 EGP)
//   EGP: 1.00   (базовая для хранилища валюта)
// API /api/rates возвращает ровно эти значения — никаких инверсий
// ни на уровне роутов, ни на уровне updater'а.

const CURRENCY_CODES = ['USD', 'EUR', 'EGP', 'RUB'];

/**
 * Курс валюты X в Y: value_X * (rateX / rateY), где rate — значение из EGP-конвенции.
 */
function convert(value, from, to, ratesByCode) {
  const rFrom = parseFloat(ratesByCode[from]);
  const rTo = parseFloat(ratesByCode[to]);
  if (!Number.isFinite(rFrom) || !Number.isFinite(rTo) || rFrom <= 0 || rTo <= 0) {
    throw new Error(`Некорректные курсы для ${from}/${to}`);
  }
  return value * (rFrom / rTo);
}

module.exports = { CURRENCY_CODES, convert };
