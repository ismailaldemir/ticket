const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Gider = require("../../models/Gider");
const GiderDetay = require("../../models/GiderDetay");
const Kasa = require("../../models/Kasa");
const Ucret = require("../../models/Ucret");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

// @route   GET api/giderler
// @desc    Tüm giderleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("giderler_goruntuleme"),
  async (req, res) => {
    try {
      const giderler = await Gider.find()
        .populate("kasa_id", ["kasaAdi"])
        .sort({ tarih: -1 });
      res.json(giderler);
    } catch (err) {
      logger.error("Giderler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/giderler/:id
// @desc    ID'ye göre gider getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("giderler_goruntuleme"),
  async (req, res) => {
    try {
      const gider = await Gider.findById(req.params.id).populate("kasa_id", [
        "kasaAdi",
      ]);

      if (!gider) {
        return res.status(404).json({ msg: "Gider kaydı bulunamadı" });
      }

      res.json(gider);
    } catch (err) {
      logger.error("Gider getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gider kaydı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/giderler/detay/:gider_id
// @desc    Gidere ait detayları getir
// @access  Özel
router.get(
  "/detay/:gider_id",
  auth,
  yetkiKontrol("giderler_goruntuleme"),
  async (req, res) => {
    try {
      const giderDetaylari = await GiderDetay.find({
        gider_id: req.params.gider_id,
      }).populate({
        path: "ucret_id",
        select: ["tutar", "birimUcret"],
        populate: {
          path: "tarife_id",
          select: ["ad", "kod"],
        },
      });

      res.json(giderDetaylari);
    } catch (err) {
      logger.error("Gider detayları getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/giderler
// @desc    Yeni gider kaydı ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("giderler_ekleme"),
    [
      check("giderTuru", "Gider türü gereklidir").not().isEmpty(),
      check("kasa_id", "Kasa ID gereklidir").not().isEmpty(),
      check("tarih", "Tarih gereklidir").not().isEmpty(),
      check("odemeTuru", "Ödeme türü gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      giderTuru,
      aciklama,
      kasa_id,
      tarih,
      belgeNo,
      giderYeri,
      odemeTuru,
      sonOdemeTarihi,
    } = req.body;

    try {
      // Kasa var mı kontrolü
      const kasa = await Kasa.findById(kasa_id);
      if (!kasa) {
        return res.status(404).json({ msg: "Belirtilen kasa bulunamadı" });
      }

      // Yeni gider kaydı oluştur
      const yeniGider = new Gider({
        giderTuru,
        aciklama,
        kasa_id,
        tarih,
        belgeNo,
        giderYeri,
        odemeTuru,
        sonOdemeTarihi,
        toplamTutar: 0, // Başlangıçta 0, detaylar eklendikçe güncellenecek
      });

      await yeniGider.save();

      // Kasa ile ilişkilendir
      const populatedGider = await Gider.findById(yeniGider._id).populate(
        "kasa_id",
        ["kasaAdi"]
      );

      res.json(populatedGider);
    } catch (err) {
      logger.error("Gider eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/giderler/detay
// @desc    Gider detay kaydı ekle
// @access  Özel
router.post(
  "/detay",
  [
    auth,
    yetkiKontrol("giderler_ekleme"),
    [
      check("gider_id", "Gider ID gereklidir").not().isEmpty(),
      check("ucret_id", "Ücret ID gereklidir").not().isEmpty(),
      check("miktar", "Miktar gereklidir").isNumeric(),
      check("birimFiyat", "Birim fiyat gereklidir").isNumeric(),
      check("toplamTutar", "Toplam tutar gereklidir").isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gider_id, ucret_id, miktar, birimFiyat, toplamTutar } = req.body;

    try {
      // Gider var mı kontrolü
      const gider = await Gider.findById(gider_id);
      if (!gider) {
        return res
          .status(404)
          .json({ msg: "Belirtilen gider kaydı bulunamadı" });
      }

      // Ücret var mı kontrolü
      const ucret = await Ucret.findById(ucret_id);
      if (!ucret) {
        return res.status(404).json({ msg: "Belirtilen ücret bulunamadı" });
      }

      // Yeni gider detay kaydı oluştur
      const yeniGiderDetay = new GiderDetay({
        gider_id,
        ucret_id,
        miktar,
        birimFiyat,
        toplamTutar,
      });

      await yeniGiderDetay.save();

      // Gider kaydındaki toplam tutarı güncelle
      gider.toplamTutar += parseFloat(toplamTutar);
      await gider.save();

      // Detay kaydını ilişkilendir
      const populatedGiderDetay = await GiderDetay.findById(
        yeniGiderDetay._id
      ).populate("ucret_id", ["ad", "tutar", "birimUcret"]);

      res.json({
        giderDetay: populatedGiderDetay,
        yeniToplamTutar: gider.toplamTutar,
      });
    } catch (err) {
      logger.error("Gider detay eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/giderler/:id
// @desc    Gider kaydını güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("giderler_guncelleme"),
  async (req, res) => {
    const {
      giderTuru,
      aciklama,
      kasa_id,
      tarih,
      belgeNo,
      giderYeri,
      odemeTuru,
      isActive,
      sonOdemeTarihi,
    } = req.body;

    // Gider güncelleme objesi
    const giderGuncelleme = {};
    if (giderTuru) giderGuncelleme.giderTuru = giderTuru;
    if (aciklama !== undefined) giderGuncelleme.aciklama = aciklama;
    if (kasa_id) giderGuncelleme.kasa_id = kasa_id;
    if (tarih) giderGuncelleme.tarih = tarih;
    if (belgeNo !== undefined) giderGuncelleme.belgeNo = belgeNo;
    if (giderYeri) giderGuncelleme.giderYeri = giderYeri;
    if (odemeTuru) giderGuncelleme.odemeTuru = odemeTuru;
    if (isActive !== undefined) giderGuncelleme.isActive = isActive;
    if (sonOdemeTarihi !== undefined)
      giderGuncelleme.sonOdemeTarihi = sonOdemeTarihi;

    try {
      // Gider kaydı var mı kontrolü
      let gider = await Gider.findById(req.params.id);

      if (!gider) {
        return res.status(404).json({ msg: "Gider kaydı bulunamadı" });
      }

      // Kasa değişiyorsa, kasa var mı kontrolü
      if (kasa_id && kasa_id !== gider.kasa_id.toString()) {
        const kasa = await Kasa.findById(kasa_id);
        if (!kasa) {
          return res.status(404).json({ msg: "Belirtilen kasa bulunamadı" });
        }
      }

      // Güncelleme yap
      gider = await Gider.findByIdAndUpdate(
        req.params.id,
        { $set: giderGuncelleme },
        { new: true }
      ).populate("kasa_id", ["kasaAdi"]);

      res.json(gider);
    } catch (err) {
      logger.error("Gider güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gider kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/giderler/:id
// @desc    Gider kaydını sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("giderler_silme"),
  async (req, res) => {
    try {
      // Gider kaydı var mı kontrolü
      const gider = await Gider.findById(req.params.id);

      if (!gider) {
        return res.status(404).json({ msg: "Gider kaydı bulunamadı" });
      }

      // Önce ilişkili detay kayıtlarını sil
      await GiderDetay.deleteMany({ gider_id: req.params.id });

      // Ardından gider kaydını sil
      await gider.remove();

      res.json({ msg: "Gider kaydı ve detayları silindi" });
    } catch (err) {
      logger.error("Gider silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gider kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/giderler/detay/:id
// @desc    Gider detay kaydı sil
// @access  Özel
router.delete(
  "/detay/:id",
  auth,
  yetkiKontrol("giderler_silme"),
  async (req, res) => {
    try {
      // Gider detay kaydı var mı kontrolü
      const giderDetay = await GiderDetay.findById(req.params.id);

      if (!giderDetay) {
        return res.status(404).json({ msg: "Gider detay kaydı bulunamadı" });
      }

      // İlgili gider kaydını bul
      const gider = await Gider.findById(giderDetay.gider_id);
      if (!gider) {
        return res.status(404).json({ msg: "İlişkili gider kaydı bulunamadı" });
      }

      // Gider toplam tutarını güncelle
      gider.toplamTutar -= giderDetay.toplamTutar;
      if (gider.toplamTutar < 0) gider.toplamTutar = 0;
      await gider.save();

      // Detay kaydını sil
      await giderDetay.remove();

      res.json({
        msg: "Gider detay kaydı silindi",
        yeniToplamTutar: gider.toplamTutar,
      });
    } catch (err) {
      logger.error("Gider detay silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gider detay kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/giderler/delete-many
// @desc    Çoklu gider kaydı silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("giderler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // İlişkili tüm detay kayıtlarını sil
      await GiderDetay.deleteMany({ gider_id: { $in: ids } });

      // Ardından gider kayıtlarını sil
      const result = await Gider.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ msg: "Silinecek gider kaydı bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet gider kaydı silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Çoklu gider silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
