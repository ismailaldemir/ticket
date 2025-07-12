const AuditLog = require("../models/AuditLog");
const logger = require("./logger");

/**
 * Sistem içerisindeki işlemleri kaydeden audit log servisi
 */
const auditLogger = {
  /**
   * Yeni bir audit log kaydı oluşturur
   * @param {Object} options Log seçenekleri
   * @param {String} options.userId Kullanıcı ID
   * @param {String} options.action İşlem (create, update, delete, login, vs)
   * @param {String} options.resource Kaynak türü (User, Rol, Yetki)
   * @param {String} options.resourceId Kaynak ID
   * @param {String} options.ip IP adresi
   * @param {Object} options.details İşlem detayları
   * @returns {Promise<AuditLog>} Oluşturulan log kaydı
   */
  log: async (options) => {
    try {
      const { userId, action, resource, resourceId, ip, details } = options;

      const auditLog = new AuditLog({
        user: userId,
        action,
        resource,
        resourceId,
        ip,
        details,
      });

      await auditLog.save();
      return auditLog;
    } catch (error) {
      logger.error("Audit log kaydı oluşturulurken hata", {
        error: error.message,
      });
      return null;
    }
  },
};

module.exports = auditLogger;
