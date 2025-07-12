const auditLogger = require("../utils/auditLogger");

/**
 * İstek ve cevapları denetim kaydına almak için kullanılan middleware
 * @param {Object} options Middleware seçenekleri
 * @param {String} options.resource Kaynak türü
 * @param {String} options.action İşlem türü
 * @returns {Function} Express middleware fonksiyonu
 */
const auditMiddleware = (options = {}) => {
  return async (req, res, next) => {
    // Orijinal 'end' metodunu kopyala
    const originalEnd = res.end;

    // Response tamamlandığında log kaydı oluştur
    res.end = async function (...args) {
      // Orijinal 'end' metodunu çağır
      originalEnd.apply(res, args);

      try {
        // Sadece başarılı işlemleri veya belirli hataları logla
        if (
          (res.statusCode >= 200 && res.statusCode < 300) ||
          res.statusCode === 401 ||
          res.statusCode === 403
        ) {
          // Kaynak ID'sini belirle
          const resourceId = options.resourceIdPath
            ? req.params[options.resourceIdPath]
            : req.params.id || null;

          // Eylem tipini belirle (varsayılan olarak HTTP metodundan)
          const action = options.action || getActionFromMethod(req.method);

          // Log kaydı oluştur
          await auditLogger.log({
            userId: req.user?.id || null,
            action,
            resource: options.resource || req.baseUrl.split("/").pop(),
            resourceId,
            ip: req.ip || req.connection.remoteAddress,
            details: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
              body: sanitizeRequestBody(req.body),
              params: req.params,
              query: req.query,
              userAgent: req.get("user-agent"),
            },
          });
        }
      } catch (err) {
        console.error("Audit log kaydedilirken hata:", err);
      }
    };

    next();
  };
};

/**
 * HTTP metodundan uygun eylem tipini belirler
 */
function getActionFromMethod(method) {
  switch (method) {
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    case "GET":
      return "read";
    default:
      return "other";
  }
}

/**
 * İstek gövdesini hassas bilgileri kaldırarak döndürür
 */
function sanitizeRequestBody(body) {
  if (!body) return null;

  const sanitized = { ...body };

  // Hassas alanları kaldır
  const sensitiveFields = [
    "password",
    "currentPassword",
    "newPassword",
    "confirmPassword",
    "token",
    "secret",
  ];
  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = "***HIDDEN***";
    }
  });

  return sanitized;
}

module.exports = auditMiddleware;
