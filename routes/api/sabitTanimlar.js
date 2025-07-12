const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const SabitTanim = require("../../models/SabitTanim");

// @route   GET api/sabit-tanimlar
// @desc    Tüm sabit tanımları getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("sabit_tanimlar_goruntuleme"),
  async (req, res) => {
    try {
      const sabitTanimlar = await SabitTanim.find().sort({ tip: 1, kod: 1 });
      res.json(sabitTanimlar);
    } catch (err) {
      logger.error("Sabit tanımlar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/sabit-tanimlar/:id
// @desc    ID'ye göre sabit tanım getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("sabit_tanimlar_goruntuleme"),
  async (req, res) => {
    try {
      const sabitTanim = await SabitTanim.findById(req.params.id);

      if (!sabitTanim) {
        return res.status(404).json({ msg: "Sabit tanım bulunamadı" });
      }

      res.json(sabitTanim);
    } catch (err) {
      logger.error("Sabit tanım getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Sabit tanım bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/sabit-tanimlar/tip/:tip
// @desc    Belirli tipteki sabit tanımları getir
// @access  Özel
router.get(
  "/tip/:tip",
  auth,
  yetkiKontrol("sabit_tanimlar_goruntuleme"),
  async (req, res) => {
    try {
      const sabitTanimlar = await SabitTanim.find({
        tip: req.params.tip,
        isActive: true,
      }).sort({ kod: 1 });

      res.json(sabitTanimlar);
    } catch (err) {
      logger.error("Belirli tipteki sabit tanımlar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/sabit-tanimlar
// @desc    Yeni sabit tanım ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("sabit_tanimlar_ekleme"),
    [
      check("tip", "Tip zorunludur").not().isEmpty(),
      check("kod", "Kod zorunludur").not().isEmpty(),
      check("aciklama", "Açıklama zorunludur").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tip, kod, aciklama, deger, isActive } = req.body;

    try {
      // Aynı tip ve kodda başka bir tanım var mı kontrol et
      const existingSabitTanim = await SabitTanim.findOne({ tip, kod });
      if (existingSabitTanim) {
        return res
          .status(400)
          .json({ msg: "Bu tip ve kodda bir sabit tanım zaten mevcut" });
      }

      // Yeni sabit tanım oluştur
      const sabitTanim = new SabitTanim({
        tip,
        kod,
        aciklama,
        deger,
        isActive: isActive !== undefined ? isActive : true,
      });

      await sabitTanim.save();
      res.json(sabitTanim);
    } catch (err) {
      logger.error("Sabit tanım eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/sabit-tanimlar/:id
// @desc    Sabit tanım güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("sabit_tanimlar_guncelleme"),
  async (req, res) => {
    const { tip, kod, aciklama, deger, isActive } = req.body;

    // Sabit tanım güncelleme objesi
    const sabitTanimGuncelleme = {};
    if (tip) sabitTanimGuncelleme.tip = tip;
    if (kod) sabitTanimGuncelleme.kod = kod;
    if (aciklama) sabitTanimGuncelleme.aciklama = aciklama;
    if (deger !== undefined) sabitTanimGuncelleme.deger = deger;
    if (isActive !== undefined) sabitTanimGuncelleme.isActive = isActive;

    try {
      // Sabit tanım var mı kontrolü
      let sabitTanim = await SabitTanim.findById(req.params.id);

      if (!sabitTanim) {
        return res.status(404).json({ msg: "Sabit tanım bulunamadı" });
      }

      // Aynı tip ve kodda başka bir tanım var mı kontrol et (kod veya tip değişiyorsa)
      if ((tip && tip !== sabitTanim.tip) || (kod && kod !== sabitTanim.kod)) {
        const existingSabitTanim = await SabitTanim.findOne({
          tip: tip || sabitTanim.tip,
          kod: kod || sabitTanim.kod,
          _id: { $ne: req.params.id },
        });

        if (existingSabitTanim) {
          return res
            .status(400)
            .json({ msg: "Bu tip ve kodda bir sabit tanım zaten mevcut" });
        }
      }

      // Güncelleme yap
      sabitTanim = await SabitTanim.findByIdAndUpdate(
        req.params.id,
        { $set: sabitTanimGuncelleme },
        { new: true }
      );

      res.json(sabitTanim);
    } catch (err) {
      logger.error("Sabit tanım güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Sabit tanım bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/sabit-tanimlar/:id
// @desc    Sabit tanım sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("sabit_tanimlar_silme"),
  async (req, res) => {
    try {
      // Sabit tanım var mı kontrolü
      const sabitTanim = await SabitTanim.findById(req.params.id);

      if (!sabitTanim) {
        return res.status(404).json({ msg: "Sabit tanım bulunamadı" });
      }

      // Sabit tanımı sil
      await sabitTanim.remove();

      res.json({ msg: "Sabit tanım silindi" });
    } catch (err) {
      logger.error("Sabit tanım silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Sabit tanım bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/sabit-tanimlar/delete-many
// @desc    Birden fazla sabit tanım sil
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("sabit_tanimlar_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // Toplu silme işlemi için
      const result = await SabitTanim.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: "Silinecek tanım bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet tanım silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Birden fazla sabit tanım silinirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
