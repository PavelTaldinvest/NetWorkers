// Обработчик 404
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Маршрут ${req.originalUrl} не найден`
    }
  });
};

module.exports = notFound;
