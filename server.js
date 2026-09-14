require('dotenv').config();
const app = require('./src/app');
const { initCronJobs } = require('./src/services/currencyUpdater');

const PORT = process.env.PORT || 3000;

// Инициализация cron-задач
initCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 API доступно на http://localhost:${PORT}/api`);
});
