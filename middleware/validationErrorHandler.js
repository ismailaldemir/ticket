// Ortak validasyon ve hata yönetimi middleware'i
const { validationResult } = require("express-validator");

function validationErrorHandler(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Hataları sadeleştirip döndür
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
}

module.exports = validationErrorHandler;
