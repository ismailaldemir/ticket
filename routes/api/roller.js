const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check, validationResult } = require("express-validator");
const logger = require("../../utils/logger");

const Rol = require("../../models/Rol");
const User = require("../../models/User");

// @route   GET api/roller
// @desc    Tüm rolleri getir
// @access  Özel
router.get("/", auth, yetkiKontrol("roller_goruntuleme"), async (req, res) => {
  try {
    logger.info("Roller endpoint çağrıldı", { userId: req.user.id });
    const roller = await Rol.find().sort({ ad: 1 }).populate({
      path: "yetkiler",
      select: "kod ad modul islem",
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
      const rol = await Rol.findById(req.params.id).populate("yetkiler", [
        "kod",
        "ad",
        "modul",
        "islem",
      ]);

      if (!rol) {
        logger.warn("Rol bulunamadı", { roleId: req.params.id });
        return res.status(404).json({ msg: "Rol bulunamadı" });
      }

      res.json(rol);
    } catch (err) {
      logger.error("Rol getirme hatası", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Rol bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Rol ekleme validasyon hatası", { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { ad, aciklama, yetkiler, isActive, isDefault } = req.body;

      // Aynı isimde rol var mı kontrol et
      const existingRol = await Rol.findOne({ ad });
      if (existingRol) {
        logger.warn("Aynı isimde rol mevcut", { roleName: ad });
        return res.status(400).json({ msg: "Bu isimde bir rol zaten mevcut" });
      }

      // Yeni rol oluştur
      const yeniRol = new Rol({
        ad,
        aciklama,
        yetkiler: yetkiler || [],
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault !== undefined ? isDefault : false,
      });

      await yeniRol.save();
      logger.info("Yeni rol oluşturuldu", { role: yeniRol });
      res.json(yeniRol);
    } catch (err) {
      logger.error("Rol eklenirken hata", { error: err });
      res.status(500).send("Sunucu hatası");
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Rol güncelleme validasyon hatası", {
        errors: errors.array(),
      });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { ad, aciklama, yetkiler, isActive, isDefault } = req.body;

      // Rol var mı kontrolü
      let rol = await Rol.findById(req.params.id);

      if (!rol) {
        logger.warn("Rol bulunamadı", { roleId: req.params.id });
        return res.status(404).json({ msg: "Rol bulunamadı" });
      }

      // Admin rolünün ismini değiştirmeyi engelle
      if (rol.isAdmin && rol.ad === "Admin" && ad !== "Admin") {
        logger.warn("Admin rolünün adı değiştirilemez", {
          roleId: req.params.id,
        });
        return res
          .status(400)
          .json({ msg: "Admin rolünün adı değiştirilemez" });
      }

      // Aynı isimde başka bir rol var mı kontrol et
      if (ad !== rol.ad) {
        const existingRol = await Rol.findOne({
          ad,
          _id: { $ne: req.params.id },
        });
        if (existingRol) {
          logger.warn("Aynı isimde rol mevcut", { roleName: ad });
          return res
            .status(400)
            .json({ msg: "Bu isimde bir rol zaten mevcut" });
        }
      }

      // Güncelleme bilgilerini ayarla
      rol.ad = ad;
      rol.aciklama = aciklama;
      if (yetkiler) rol.yetkiler = yetkiler;
      if (isActive !== undefined) rol.isActive = isActive;
      if (isDefault !== undefined && !rol.isAdmin) rol.isDefault = isDefault;
      rol.sonGuncellemeTarihi = Date.now();

      await rol.save();

      // Güncellenen rolü döndür
      const guncelRol = await Rol.findById(req.params.id).populate("yetkiler", [
        "kod",
        "ad",
        "modul",
        "islem",
      ]);
      logger.info("Rol güncellendi", { role: guncelRol });
      res.json(guncelRol);
    } catch (err) {
      logger.error("Rol güncellenirken hata", { error: err });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Rol bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/roller/:id
// @desc    Rol sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("roller_silme"), async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);

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
    const kullaniciSayisi = await User.countDocuments({
      roller: req.params.id,
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

    await rol.remove();
    logger.info("Rol silindi", { roleId: req.params.id });
    res.json({ msg: "Rol başarıyla silindi", id: req.params.id });
  } catch (err) {
    logger.error("Rol silinirken hata", { error: err });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Rol bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/roller/active
// @desc    Aktif rolleri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("roller_goruntuleme"),
  async (req, res) => {
    try {
      const roller = await Rol.find({ isActive: true }).sort({ ad: 1 });
      logger.info("Aktif roller getirildi", { count: roller.length });
      res.json(roller);
    } catch (err) {
      logger.error("Aktif roller getirilirken hata", { error: err });
      res.status(500).send("Sunucu hatası");
    }
  }
);

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
      const korunanRoller = await Rol.find({
        _id: { $in: ids },
        $or: [{ isAdmin: true }, { isDefault: true }],
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
      const kullaniciSayisi = await User.countDocuments({
        roller: { $in: ids },
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

      const result = await Rol.deleteMany({ _id: { $in: ids } });

      logger.info("Roller toplu olarak silindi", {
        deletedCount: result.deletedCount,
        deletedIds: ids,
      });
      res.json({
        msg: `${result.deletedCount} rol başarıyla silindi`,
        silinen: ids,
      });
    } catch (err) {
      logger.error("Toplu rol silinirken hata", { error: err });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
