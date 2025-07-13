const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check } = require("express-validator");
const validationErrorHandler = require("../../middleware/validationErrorHandler");
const logger = require("../../utils/logger");

const Rol = require("../../models/Rol");
const User = require("../../models/User");
const Yetki = require("../../models/Yetki");

// @route   GET api/roller/active
// @desc    Aktif rolleri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("roller_goruntuleme"),
  async (req, res) => {
    try {
      const roller = await Rol.findAll({
        where: { isActive: true },
        order: [["ad", "ASC"]],
      });
      logger.info("Aktif roller getirildi", { count: roller.length });
      res.json(roller);
    } catch (err) {
      logger.error("Aktif roller getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/roller
// @desc    Tüm rolleri getir
// @access  Özel
router.get("/", auth, yetkiKontrol("roller_goruntuleme"), async (req, res) => {
  try {
    logger.info("Roller endpoint çağrıldı", { userId: req.user.id });
    const roller = await Rol.findAll({
      include: [
        {
          model: Yetki,
          as: "yetkiler",
          attributes: ["kod", "ad", "modul", "islem"],
        },
      ],
      order: [["ad", "ASC"]],
    });

    logger.info(`${roller.length} adet rol bulundu`);
    res.json(roller);
  } catch (err) {
    logger.error("Rolleri getirme hatası", { error: err.message });
    res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
  }
});

// @route   GET api/roller/:id
// @desc    ID'ye göre rol getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("roller_goruntuleme"),
  async (req, res) => {
    try {
      if (!req.params.id || req.params.id === "undefined") {
        logger.warn("Geçersiz rol ID", { roleId: req.params.id });
        return res.status(400).json({ msg: "Geçersiz rol ID" });
      }
      const rol = await Rol.findByPk(req.params.id, {
        include: [
          {
            model: Yetki,
            as: "yetkiler",
            attributes: ["kod", "ad", "modul", "islem"],
          },
        ],
      });

      if (!rol) {
        logger.warn("Rol bulunamadı", { roleId: req.params.id });
        return res.status(404).json({ msg: "Rol bulunamadı" });
      }

      res.json(rol);
    } catch (err) {
      logger.error("Rol getirme hatası", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   POST api/roller
// @desc    Yeni rol ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("roller_ekleme"),
    [check("ad", "Rol adı gereklidir").not().isEmpty()],
  ],
  validationErrorHandler,
  async (req, res) => {
    try {
      const { ad, aciklama, yetkiler, isActive, isDefault } = req.body;

      // Aynı isimde rol var mı kontrol et
      const existingRol = await Rol.findOne({ where: { ad } });
      if (existingRol) {
        logger.warn("Aynı isimde rol mevcut", { roleName: ad });
        return res.status(400).json({ msg: "Bu isimde bir rol zaten mevcut" });
      }

      // Admin rolü manuel eklenemez
      if (ad && ad.toLowerCase() === "admin") {
        logger.warn("Admin rolü sistem için gereklidir ve eklenemez", { ad });
        return res
          .status(400)
          .json({ msg: "Admin rolü sistem için gereklidir ve eklenemez" });
      }

      // Yeni rol oluştur
      const yeniRol = await Rol.create({
        ad,
        aciklama,
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault !== undefined ? isDefault : false,
      });

      // Eğer yetkiler varsa, bunları ekle
      if (yetkiler && Array.isArray(yetkiler)) {
        await yeniRol.setYetkiler(yetkiler);
      }

      // Rol ile yetkilerini birlikte getir
      const populatedRol = await Rol.findByPk(yeniRol.id, {
        include: [
          {
            model: Yetki,
            as: "yetkiler",
            attributes: ["kod", "ad", "modul", "islem"],
          },
        ],
      });

      logger.info("Yeni rol oluşturuldu", { role: populatedRol });
      res.json(populatedRol);
    } catch (err) {
      logger.error("Rol eklenirken hata", { error: err });
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   PUT api/roller/:id
// @desc    Rol bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  [
    auth,
    yetkiKontrol("roller_duzenleme"),
    [check("ad", "Rol adı gereklidir").not().isEmpty()],
  ],
  validationErrorHandler,
  async (req, res) => {
    try {
      const { ad, aciklama, yetkiler, isActive, isDefault } = req.body;

      // Rol var mı kontrolü
      let rol = await Rol.findByPk(req.params.id);

      if (!rol) {
        logger.warn("Rol bulunamadı", { roleId: req.params.id });
        return res.status(404).json({ msg: "Rol bulunamadı" });
      }

      // Admin rolünün ismini değiştirmeyi veya isAdmin flag'ini değiştirmeyi engelle
      if (rol.isAdmin) {
        if (ad !== rol.ad) {
          logger.warn("Admin rolünün adı değiştirilemez", {
            roleId: req.params.id,
          });
          return res
            .status(400)
            .json({ msg: "Admin rolünün adı değiştirilemez" });
        }
        if (isActive === false) {
          logger.warn("Admin rolü deaktif edilemez", {
            roleId: req.params.id,
          });
          return res.status(400).json({ msg: "Admin rolü deaktif edilemez" });
        }
        // Admin rolünün yetkileri değiştirilemez
        if (yetkiler && Array.isArray(yetkiler)) {
          logger.warn("Admin rolünün yetkileri değiştirilemez", {
            roleId: req.params.id,
          });
          return res
            .status(400)
            .json({ msg: "Admin rolünün yetkileri değiştirilemez" });
        }
      }

      // Aynı isimde başka bir rol var mı kontrol et
      if (ad !== rol.ad) {
        const { Op } = require("sequelize");
        const existingRol = await Rol.findOne({
          where: {
            ad,
            id: { [Op.ne]: req.params.id },
          },
        });
        if (existingRol) {
          logger.warn("Aynı isimde rol mevcut", { roleName: ad });
          return res
            .status(400)
            .json({ msg: "Bu isimde bir rol zaten mevcut" });
        }
        // Admin rolü ismine güncelleme ile erişim engeli
        if (ad.toLowerCase() === "admin") {
          logger.warn("Admin rolü sistem için gereklidir ve güncellenemez", {
            ad,
          });
          return res.status(400).json({
            msg: "Admin rolü sistem için gereklidir ve güncellenemez",
          });
        }
      }

      // Güncelleme bilgilerini ayarla
      rol.ad = ad;
      rol.aciklama = aciklama;
      if (isActive !== undefined) rol.isActive = isActive;
      if (isDefault !== undefined && !rol.isAdmin) rol.isDefault = isDefault;
      rol.sonGuncellemeTarihi = new Date();

      await rol.save();

      // Eğer yetkiler varsa, bunları güncelle
      if (yetkiler && Array.isArray(yetkiler)) {
        await rol.setYetkiler(yetkiler);
      }

      // Güncellenen rolü döndür
      const guncelRol = await Rol.findByPk(req.params.id, {
        include: [
          {
            model: Yetki,
            as: "yetkiler",
            attributes: ["kod", "ad", "modul", "islem"],
          },
        ],
      });
      logger.info("Rol güncellendi", { role: guncelRol });
      res.json(guncelRol);
    } catch (err) {
      logger.error("Rol güncellenirken hata", { error: err });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/roller/:id
// @desc    Rol sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("roller_silme"), async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);

    if (!rol) {
      logger.warn("Rol bulunamadı", { roleId: req.params.id });
      return res.status(404).json({ msg: "Rol bulunamadı" });
    }

    // Admin veya varsayılan rolleri silmeyi engelle
    if (rol.isAdmin || rol.isDefault) {
      logger.warn("Admin veya varsayılan rol silinemez", {
        roleId: req.params.id,
      });
      return res.status(400).json({
        msg: rol.isAdmin ? "Admin rolü silinemez" : "Varsayılan rol silinemez",
      });
    }

    // Bu rolü kullanan kullanıcıları kontrol et
    const { Op } = require("sequelize");
    const kullaniciSayisi = await User.count({
      include: [
        {
          model: Rol,
          as: "roller",
          where: {
            id: req.params.id,
          },
          required: true,
        },
      ],
    });

    if (kullaniciSayisi > 0) {
      logger.warn("Rolü kullanan kullanıcılar mevcut", {
        roleId: req.params.id,
        userCount: kullaniciSayisi,
      });
      return res.status(400).json({
        msg: `Bu rolü kullanan ${kullaniciSayisi} kullanıcı bulunmaktadır. Önce kullanıcılardan bu rolü kaldırın.`,
      });
    }

    await rol.destroy();
    logger.info("Rol silindi", { roleId: req.params.id });
    res.json({ msg: "Rol başarıyla silindi", id: req.params.id });
  } catch (err) {
    logger.error("Rol silinirken hata", { error: err });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/roller/bulk-delete
// @desc    Toplu rol silme
// @access  Özel
router.post(
  "/bulk-delete",
  auth,
  yetkiKontrol("roller_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        logger.warn("Geçersiz rol ID'leri sağlandı", { ids });
        return res
          .status(400)
          .json({ msg: "Geçerli rol ID'leri sağlanmalıdır" });
      }

      // Admin veya varsayılan rolleri kontrol et
      const { Op } = require("sequelize");
      const korunanRoller = await Rol.findAll({
        where: {
          id: { [Op.in]: ids },
          [Op.or]: [{ isAdmin: true }, { isDefault: true }],
        },
      });

      if (korunanRoller.length > 0) {
        logger.warn("Admin veya varsayılan roller silinemez", {
          protectedRoles: korunanRoller.map((r) => r.ad),
        });
        return res.status(400).json({
          msg: "Admin veya varsayılan roller silinemez",
          korunanRoller: korunanRoller.map((r) => r.ad),
        });
      }

      // Bu rolleri kullanan kullanıcıları kontrol et
      const kullaniciSayisi = await User.count({
        include: [
          {
            model: Rol,
            as: "roller",
            where: {
              id: { [Op.in]: ids },
            },
            required: true,
          },
        ],
      });

      if (kullaniciSayisi > 0) {
        logger.warn("Rolleri kullanan kullanıcılar mevcut", {
          roleIds: ids,
          userCount: kullaniciSayisi,
        });
        return res.status(400).json({
          msg: `Bu rolleri kullanan ${kullaniciSayisi} kullanıcı bulunmaktadır. Önce kullanıcılardan bu rolleri kaldırın.`,
        });
      }

      const result = await Rol.destroy({
        where: { id: { [Op.in]: ids } },
      });

      logger.info("Roller toplu olarak silindi", {
        deletedCount: result,
        deletedIds: ids,
      });
      res.json({
        msg: `${result} rol başarıyla silindi`,
        silinen: ids,
      });
    } catch (err) {
      logger.error("Toplu rol silinirken hata", { error: err });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
