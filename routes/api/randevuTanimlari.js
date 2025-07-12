const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");

const RandevuTanimi = require("../../models/RandevuTanimi");

// @route   GET api/randevu-tanimlari
// @desc    Tüm randevu tanımlarını getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("randevu_tanimlari_goruntuleme"),
  async (req, res) => {
    try {
      const randevuTanimlari = await RandevuTanimi.find()
        .sort({ createdAt: -1 })
        .populate("olusturanKullanici_id", "name");

      res.json(randevuTanimlari);
    } catch (err) {
      logger.error("Randevu tanımları getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/randevu-tanimlari/active
// @desc    Aktif randevu tanımlarını getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("randevu_tanimlari_goruntuleme"),
  async (req, res) => {
    try {
      const randevuTanimlari = await RandevuTanimi.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate("olusturanKullanici_id", "name");

      res.json(randevuTanimlari);
    } catch (err) {
      logger.error("Aktif randevu tanımları getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/randevu-tanimlari/:id
// @desc    ID'ye göre randevu tanımını getir
// @access  Özel
router.get(
  "/:id",
  [auth, yetkiKontrol("randevular_goruntuleme")],
  async (req, res) => {
    try {
      const randevuTanimi = await RandevuTanimi.findById(
        req.params.id
      ).populate("olusturanKullanici_id", "name");

      if (!randevuTanimi) {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      res.json(randevuTanimi);
    } catch (err) {
      logger.error("Randevu tanımı getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/randevu-tanimlari
// @desc    Yeni randevu tanımı ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("randevular_ekleme"),
    [
      check("ad", "Tanım adı gereklidir").not().isEmpty(),
      check("gunler", "En az bir gün seçilmelidir").isArray({ min: 1 }),
      check("baslangicSaati", "Başlangıç saati gereklidir").not().isEmpty(),
      check("bitisSaati", "Bitiş saati gereklidir").not().isEmpty(),
      check("slotSuresiDk", "Slot süresi gereklidir").isNumeric({ min: 5 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      ad,
      aciklama,
      gunler,
      baslangicSaati,
      bitisSaati,
      slotSuresiDk,
      maksimumKisi,
      lokasyon,
      isActive,
    } = req.body;

    // Başlangıç ve bitiş saatlerini kontrol et
    const baslangicRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const bitisRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!baslangicRegex.test(baslangicSaati)) {
      return res.status(400).json({
        msg: "Geçersiz başlangıç saati formatı. Saat formatı HH:MM şeklinde olmalıdır.",
      });
    }

    if (!bitisRegex.test(bitisSaati)) {
      return res.status(400).json({
        msg: "Geçersiz bitiş saati formatı. Saat formatı HH:MM şeklinde olmalıdır.",
      });
    }

    try {
      // Yeni randevu tanımı oluştur
      const yeniRandevuTanimi = new RandevuTanimi({
        ad,
        aciklama,
        gunler,
        baslangicSaati,
        bitisSaati,
        slotSuresiDk,
        maksimumKisi: maksimumKisi || 1,
        lokasyon,
        isActive: isActive !== undefined ? isActive : true,
        olusturanKullanici_id: req.user.id,
      });

      const randevuTanimi = await yeniRandevuTanimi.save();
      res.json(randevuTanimi);
    } catch (err) {
      logger.error("Randevu tanımı eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/randevu-tanimlari/:id
// @desc    Randevu tanımını güncelle
// @access  Özel
router.put(
  "/:id",
  [
    auth,
    yetkiKontrol("randevular_duzenleme"),
    [
      check("ad", "Tanım adı gereklidir").not().isEmpty(),
      check("gunler", "En az bir gün seçilmelidir").isArray({ min: 1 }),
      check("baslangicSaati", "Başlangıç saati gereklidir").not().isEmpty(),
      check("bitisSaati", "Bitiş saati gereklidir").not().isEmpty(),
      check("slotSuresiDk", "Slot süresi gereklidir").isNumeric({ min: 5 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      ad,
      aciklama,
      gunler,
      baslangicSaati,
      bitisSaati,
      slotSuresiDk,
      maksimumKisi,
      lokasyon,
      isActive,
    } = req.body;

    // Randevu tanımını güncelleme
    const tanımGuncelleme = {};
    if (ad) tanımGuncelleme.ad = ad;
    if (aciklama !== undefined) tanımGuncelleme.aciklama = aciklama;
    if (gunler && Array.isArray(gunler)) tanımGuncelleme.gunler = gunler;
    if (baslangicSaati) tanımGuncelleme.baslangicSaati = baslangicSaati;
    if (bitisSaati) tanımGuncelleme.bitisSaati = bitisSaati;
    if (slotSuresiDk) tanımGuncelleme.slotSuresiDk = slotSuresiDk;
    if (maksimumKisi) tanımGuncelleme.maksimumKisi = maksimumKisi;
    if (lokasyon !== undefined) tanımGuncelleme.lokasyon = lokasyon;
    if (isActive !== undefined) tanımGuncelleme.isActive = isActive;

    try {
      // Randevu tanımı var mı kontrolü
      let tanım = await RandevuTanimi.findById(req.params.id);

      if (!tanım) {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      // Güncelleme
      tanım = await RandevuTanimi.findByIdAndUpdate(
        req.params.id,
        { $set: tanımGuncelleme },
        { new: true }
      );

      res.json(tanım);
    } catch (err) {
      logger.error("Randevu tanımı güncellenirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/randevu-tanimlari/:id
// @desc    Randevu tanımını sil
// @access  Özel
router.delete(
  "/:id",
  [auth, yetkiKontrol("randevular_silme")],
  async (req, res) => {
    try {
      const randevuTanimi = await RandevuTanimi.findById(req.params.id);

      if (!randevuTanimi) {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      await randevuTanimi.remove();
      res.json({ msg: "Randevu tanımı silindi" });
    } catch (err) {
      logger.error("Randevu tanımı silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/randevu-tanimlari
// @desc    Çoklu randevu tanımı silme
// @access  Özel
router.post(
  "/delete-many",
  [auth, yetkiKontrol("randevular_silme")],
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek randevu tanımlarının ID'leri gereklidir" });
      }

      await RandevuTanimi.deleteMany({ _id: { $in: ids } });
      res.json({ msg: `${ids.length} randevu tanımı silindi` });
    } catch (err) {
      logger.error("Çoklu randevu tanımı silinirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
