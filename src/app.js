const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Импорт роутов
const authRoutes = require('./routes/auth');
const propertiesRoutes = require('./routes/properties');
const applicationsRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const ratesRoutes = require('./routes/rates');
const referenceRoutes = require('./routes/references');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // Логирование запросов

// Статика
app.use(express.static('.'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const db = require('../config/db');
  
  db.query('SELECT NOW()')
    .then(() => {
      res.json({
        status: 'ok',
        db: true,
        uptime: process.uptime()
      });
    })
    .catch(() => {
      res.json({
        status: 'ok',
        db: false,
        uptime: process.uptime()
      });
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api', referenceRoutes);

// Обработчик 404
app.use(notFound);

// Центральный обработчик ошибок
app.use(errorHandler);

module.exports = app;
