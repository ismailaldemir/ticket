const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const Telefon = require("../../models/Telefon");

// @route   GET api/telefon
// @desc    Tüm telefonları getir
// @access  Özel
router.get("/", auth, yetkiKontrol("telefon_goruntuleme"), async (req, res) => {
  try {
    const telefonlar = await Telefon.find().sort({ kayitTarihi: -1 });
    res.json(telefonlar);
  } catch (err) {
    logger.error("Telefonlar getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/telefon/:id
// @desc    ID'ye göre telefon getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("telefon_goruntuleme"),
  async (req, res) => {
    try {
      const telefon = await Telefon.findById(req.params.id);

      if (!telefon) {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }

      res.json(telefon);
    } catch (err) {
      logger.error("Telefon getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/telefon/referans/:tip/:id
// @desc    Referans türü ve ID'ye göre telefonları getir
// @access  Özel
router.get(
  "/referans/:tip/:id",
  auth,
  yetkiKontrol("telefon_goruntuleme"),
  async (req, res) => {
    try {
      const telefonlar = await Telefon.find({
        referans_turu: req.params.tip,
        referans_id: req.params.id,
      }).sort({ kayitTarihi: -1 });

      res.json(telefonlar);
    } catch (err) {
      logger.error("Referansa göre telefonlar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/telefon
// @desc    Yeni telefon ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("telefon_ekleme"),
    [
      check("referans_turu", "Referans türü gereklidir").not().isEmpty(),
      check("referans_id", "Referans ID gereklidir").not().isEmpty(),
      check("telefon_turu", "Telefon türü gereklidir").not().isEmpty(),
      check("telefon_no", "Telefon numarası gereklidir").not().isEmpty(),
    ],
    require("../../middleware/validationErrorHandler"),
  ],
  async (req, res) => {
    const {
      referans_turu,
      referans_id,
      telefon_turu,
      telefon_no,
      aciklama,
      isActive,
    } = req.body;

    try {
      const yeniTelefon = new Telefon({
        referans_turu,
        referans_id,
        telefon_turu,
        telefon_no,
        aciklama,
        isActive: isActive !== undefined ? isActive : true,
      });

      const telefon = await yeniTelefon.save();
      res.json(telefon);
    } catch (err) {
      logger.error("Telefon eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/telefon/:id
// @desc    Update telefon
// @access  Private
router.put(
  "/:id",
  [
    auth,
    yetkiKontrol("telefon_guncelleme"),
    [check("telefonNumarasi", "Telefon numarası gereklidir").not().isEmpty()],
    require("../../middleware/validationErrorHandler"),
  ],
  async (req, res) => {
    try {
      const { telefonNumarasi, tur, aciklama, durumu } = req.body;

      // Telefon var mı kontrol et
      let telefon = await Telefon.findById(req.params.id);
      if (!telefon) {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }

      // Güncelleme verilerini hazırla
      const updateData = {
        telefonNumarasi,
        tur,
        aciklama,
        durumu,
      };

      // Güncelle
      telefon = await Telefon.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      res.json(telefon);
    } catch (err) {
      logger.error("Telefon güncelleme hatası", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }
      res.status(500).json({ msg: "Sunucu hatası" });
    }
  }
);

// @route   DELETE api/telefon/:id
// @desc    Telefon sil
// @access  Private
router.delete("/:id", auth, yetkiKontrol("telefon_silme"), async (req, res) => {
  try {
    const telefon = await Telefon.findById(req.params.id);

    if (!telefon) {
      return res.status(404).json({ msg: "Telefon bulunamadı" });
    }

    await telefon.deleteOne();

    res.json({
      success: true,
      msg: "Telefon bilgisi silindi",
      id: req.params.id,
    });
  } catch (err) {
    logger.error("Telefon silme hatası", { error: err.message });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Telefon bulunamadı" });
    }
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

// @route   DELETE api/telefon/kisi/:id
// @desc    Kişiye ait telefon bilgisini sil
// @access  Private
router.delete("/kisi/:id", auth, async (req, res) => {
  try {
    const telefon = await Telefon.findById(req.params.id);

    if (!telefon) {
      return res.status(404).json({ msg: "Telefon bulunamadı" });
    }

    // Telefonu sil
    await telefon.remove();
    res.json({ msg: "Telefon bilgisi silindi" });
  } catch (err) {
    logger.error("Telefon silme hatası", { error: err.message });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Telefon bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
