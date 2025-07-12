const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const UyeRol = require("../../models/UyeRol");
const Kisi = require("../../models/Kisi");

// @route   GET api/uyeRoller
// @desc    Tüm üye rollerini getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("uyeRoller_goruntuleme"),
  async (req, res) => {
    try {
      const uyeRoller = await UyeRol.find().sort({ ad: 1 });
      logger.info("Tüm üye roller getirildi", { count: uyeRoller.length });
      res.json(uyeRoller);
    } catch (err) {
      logger.error("Üye roller getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/uyeRoller/active
// @desc    Aktif üye rollerini getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("uyeRoller_goruntuleme"),
  async (req, res) => {
    try {
      const uyeRoller = await UyeRol.find({ isActive: true }).sort({ ad: 1 });
      logger.info("Aktif üye roller getirildi", { count: uyeRoller.length });
      res.json(uyeRoller);
    } catch (err) {
      logger.error("Aktif üye roller getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/uyeRoller/:id
// @desc    ID'ye göre üye rolü getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("uyeRoller_goruntuleme"),
  async (req, res) => {
    try {
      const uyeRol = await UyeRol.findById(req.params.id);

      if (!uyeRol) {
        return res.status(404).json({ msg: "Üye rolü bulunamadı" });
      }

      res.json(uyeRol);
    } catch (err) {
      logger.error("Üye rolü getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Üye rolü bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/uyeRoller
// @desc    Yeni üye rolü ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("uyeRoller_ekleme"),
    [check("ad", "Rol adı gereklidir").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ad, aciklama, aylıkUcrettenMuaf, isActive } = req.body;

    try {
      // Aynı isimde rol var mı kontrol et
      const existingUyeRol = await UyeRol.findOne({ ad });
      if (existingUyeRol) {
        return res
          .status(400)
          .json({ msg: "Bu isimde bir üye rolü zaten mevcut" });
      }

      // Yeni üye rolü oluştur
      const uyeRol = new UyeRol({
        ad,
        aciklama,
        aylıkUcrettenMuaf:
          aylıkUcrettenMuaf !== undefined ? aylıkUcrettenMuaf : false,
        isActive: isActive !== undefined ? isActive : true,
      });

      await uyeRol.save();
      res.json(uyeRol);
    } catch (err) {
      logger.error("Yeni üye rolü eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/uyeRoller/:id
// @desc    Üye rolü bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("uyeRoller_guncelleme"),
  async (req, res) => {
    const { ad, aciklama, aylıkUcrettenMuaf, isActive } = req.body;

    // Rol bilgilerini güncelleme
    const uyeRolGuncelleme = {};
    if (ad) uyeRolGuncelleme.ad = ad;
    if (aciklama !== undefined) uyeRolGuncelleme.aciklama = aciklama;
    if (aylıkUcrettenMuaf !== undefined)
      uyeRolGuncelleme.aylıkUcrettenMuaf = aylıkUcrettenMuaf;
    if (isActive !== undefined) uyeRolGuncelleme.isActive = isActive;

    try {
      // Rol var mı kontrolü
      let uyeRol = await UyeRol.findById(req.params.id);

      if (!uyeRol) {
        return res.status(404).json({ msg: "Üye rolü bulunamadı" });
      }

      // Aynı isimde başka bir rol var mı kontrol et (isim değişiyorsa)
      if (ad && ad !== uyeRol.ad) {
        const existingUyeRol = await UyeRol.findOne({ ad });
        if (existingUyeRol) {
          return res
            .status(400)
            .json({ msg: "Bu isimde bir üye rolü zaten mevcut" });
        }
      }

      // Güncelleme yap
      uyeRol = await UyeRol.findByIdAndUpdate(
        req.params.id,
        { $set: uyeRolGuncelleme },
        { new: true }
      );

      res.json(uyeRol);
    } catch (err) {
      logger.error("Üye rolü güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Üye rolü bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/uyeRoller/:id
// @desc    Üye rolü sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("uyeRoller_silme"),
  async (req, res) => {
    try {
      // Rol var mı kontrolü
      const uyeRol = await UyeRol.findById(req.params.id);

      if (!uyeRol) {
        return res.status(404).json({ msg: "Üye rolü bulunamadı" });
      }

      // Bu role sahip kişiler var mı kontrolü
      const kisiler = await Kisi.countDocuments({ uyeRol_id: req.params.id });

      if (kisiler > 0) {
        return res.status(400).json({
          msg: "Bu üye rolü silinemiyor, çünkü bu role sahip kişiler var",
          count: kisiler,
        });
      }

      // Üye rolünü sil
      await uyeRol.remove();
      logger.info("Üye rolü silindi", { id: req.params.id });
      res.json({ msg: "Üye rolü silindi" });
    } catch (err) {
      logger.error("Üye rolü silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Üye rolü bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/uyeRoller/delete-many
// @desc    Birden fazla üye rolü sil
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("uyeRoller_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // Rollere bağlı kişileri kontrol et
      for (const id of ids) {
        const kisiCount = await Kisi.countDocuments({ uyeRol_id: id });
        if (kisiCount > 0) {
          return res.status(400).json({
            msg: `Seçili rollere sahip kişiler var. Önce bu kişilerin rollerini değiştirmeniz gerekiyor.`,
            rolId: id,
            count: kisiCount,
          });
        }
      }

      // Toplu silme işlemi için
      const result = await UyeRol.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: "Silinecek üye rolü bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet üye rolü silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Birden fazla üye rolü silinirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
