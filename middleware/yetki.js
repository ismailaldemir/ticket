const User = require("../models/User");
const logger = require("../utils/logger");

/**
 * Belirli bir yetkiye sahip olup olmadığını kontrol eden middleware
 * @param {String} yetkiKodu - Kontrol edilecek yetki kodu
 * @returns {Function} Middleware fonksiyonu
 */
const yetkiKontrol = (yetkiKodu) => async (req, res, next) => {
  try {
    // Kullanıcının rollerini ve rollerin yetkilerini include et
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: "roller",
          attributes: ["id", "ad", "isAdmin"],
          include: [
            {
              association: "yetkiler",
              attributes: ["kod"],
            },
          ],
        },
      ],
    });

    if (!user) {
      logger.warn("Kullanıcı bulunamadı", { userId: req.user.id });
      return res.status(401).json({ msg: "Kullanıcı bulunamadı" });
    }

    if (!user.roller || user.roller.length === 0) {
      logger.warn(`Kullanıcı (${user.name}) rolleri bulunamadı veya boş`);
      return res.status(403).json({
        msg: "Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır",
        detail: "Kullanıcıya rol atanmamış",
      });
    }

    // Admin rolüne sahip kullanıcılar tüm yetkilere sahiptir
    const adminRolVarMi = user.roller.some(
      (rol) => rol.isAdmin === true || rol.ad === "Admin"
    );

    if (adminRolVarMi) {
      logger.info(
        `Admin rolüne sahip kullanıcı (${user.name}) erişim yetkisi onaylandı: ${yetkiKodu}`,
        {
          userId: user.id,
          endpoint: req.originalUrl || req.url,
          method: req.method,
          yetkiKodu,
        }
      );
      return next();
    }

    // Kullanıcının rollerinden tüm yetki kodlarını topla
    const kullaniciYetkileri = [];
    user.roller.forEach((rol) => {
      if (rol.yetkiler && Array.isArray(rol.yetkiler)) {
        rol.yetkiler.forEach((yetki) => {
          if (yetki && yetki.kod && !kullaniciYetkileri.includes(yetki.kod)) {
            kullaniciYetkileri.push(yetki.kod);
          }
        });
      }
    });

    if (kullaniciYetkileri.includes(yetkiKodu)) {
      logger.info(
        `Kullanıcı (${user.name}) için yetki onaylandı: ${yetkiKodu}`,
        { userId: user.id }
      );
      return next();
    } else {
      logger.warn("Yetki reddedildi", { userId: user.id, yetkiKodu });
      return res.status(403).json({
        msg: "Bu işlemi gerçekleştirmek için yetkiniz yok.",
        yetkiKodu,
      });
    }
  } catch (err) {
    logger.error("Yetki kontrolünde hata", { error: err.message });
    return res.status(500).json({ msg: "Yetki kontrolünde sunucu hatası" });
  }
};

module.exports = yetkiKontrol;
