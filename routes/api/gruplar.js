const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check, validationResult } = require("express-validator");
const logger = require("../../utils/logger");

const Grup = require("../../models/Grup");
const Kisi = require("../../models/Kisi");

// @route   GET api/gruplar
// @desc    Tüm grupları getir
// @access  Özel
router.get("/", auth, yetkiKontrol("gruplar_goruntuleme"), async (req, res) => {
  try {
    const gruplar = await Grup.findAll({
      order: [["grupAdi", "ASC"]],
    });
    logger.info("Tüm gruplar getirildi", { count: gruplar.length });
    res.json(gruplar);
  } catch (err) {
    logger.error("Gruplar getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/gruplar/active
// @desc    Aktif grupları getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("gruplar_goruntuleme"),
  async (req, res) => {
    try {
      const gruplar = await Grup.find({ isActive: true }).sort({ grupAdi: 1 });
      logger.info("Aktif gruplar getirildi", { count: gruplar.length });
      res.json(gruplar);
    } catch (err) {
      logger.error("Aktif gruplar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/gruplar/:id
// @desc    ID'ye göre grup getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("gruplar_goruntuleme"),
  async (req, res) => {
    try {
      const grup = await Grup.findById(req.params.id);

      if (!grup) {
        logger.warn("Grup bulunamadı", { grupId: req.params.id });
        return res.status(404).json({ msg: "Grup bulunamadı" });
      }

      logger.info("Grup getirildi", { grupId: req.params.id });
      res.json(grup);
    } catch (err) {
      logger.error("Grup getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Grup bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/gruplar
// @desc    Yeni grup ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("gruplar_ekleme"),
    [check("grupAdi", "Grup adı gereklidir").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Grup ekleme validasyon hatası", { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { grupAdi, isActive } = req.body;

    try {
      // Aynı isimde grup var mı kontrol et
      const existingGrup = await Grup.findOne({ grupAdi });
      if (existingGrup) {
        logger.warn("Aynı isimde grup mevcut", { grupAdi });
        return res.status(400).json({ msg: "Bu isimde bir grup zaten mevcut" });
      }

      // Yeni grup oluştur
      const grup = new Grup({
        grupAdi,
        isActive: isActive !== undefined ? isActive : true,
      });

      await grup.save();
      logger.info("Yeni grup oluşturuldu", { grupId: grup._id });
      res.json(grup);
    } catch (err) {
      logger.error("Grup eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/gruplar/:id
// @desc    Grup bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("gruplar_guncelleme"),
  async (req, res) => {
    const { grupAdi, isActive } = req.body;

    // Grup bilgilerini güncelleme
    const grupGuncelleme = {};
    if (grupAdi) grupGuncelleme.grupAdi = grupAdi;
    if (isActive !== undefined) grupGuncelleme.isActive = isActive;

    try {
      // Grup var mı kontrolü
      let grup = await Grup.findById(req.params.id);

      if (!grup) {
        logger.warn("Grup bulunamadı", { grupId: req.params.id });
        return res.status(404).json({ msg: "Grup bulunamadı" });
      }

      // Aynı isimde başka bir grup var mı kontrol et (isim değişiyorsa)
      if (grupAdi && grupAdi !== grup.grupAdi) {
        const existingGrup = await Grup.findOne({ grupAdi });
        if (existingGrup) {
          logger.warn("Aynı isimde grup mevcut", { grupAdi });
          return res
            .status(400)
            .json({ msg: "Bu isimde bir grup zaten mevcut" });
        }
      }

      // Güncelleme yap
      grup = await Grup.findByIdAndUpdate(
        req.params.id,
        { $set: grupGuncelleme },
        { new: true }
      );

      logger.info("Grup güncellendi", { grupId: req.params.id });
      res.json(grup);
    } catch (err) {
      logger.error("Grup güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Grup bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/gruplar/:id
// @desc    Grup sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("gruplar_silme"), async (req, res) => {
  try {
    // Grup var mı kontrolü
    const grup = await Grup.findById(req.params.id);

    if (!grup) {
      logger.warn("Grup bulunamadı", { grupId: req.params.id });
      return res.status(404).json({ msg: "Grup bulunamadı" });
    }

    // Grupta kayıtlı kişi var mı kontrolü
    const kisiler = await Kisi.countDocuments({ grup_id: req.params.id });

    if (kisiler > 0) {
      logger.warn("Grup silinemiyor, çünkü bu gruba ait kişiler var", {
        grupId: req.params.id,
        count: kisiler,
      });
      return res.status(400).json({
        msg: "Bu grup silinemiyor, çünkü bu gruba ait kişiler var",
        count: kisiler,
      });
    }

    // Grubu sil
    await grup.remove();
    logger.info("Grup silindi", { grupId: req.params.id });
    res.json({ msg: "Grup silindi" });
  } catch (err) {
    logger.error("Grup silinirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Grup bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
