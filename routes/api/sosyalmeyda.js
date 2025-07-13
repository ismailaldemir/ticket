const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");
const { check } = require("express-validator");
const validationErrorHandler = require("../../middleware/validationErrorHandler");

// Sosyal medya görüntüleme
router.get(
  "/",
  auth,
  yetkiKontrol("sosyalmeyda_goruntuleme"),
  async (req, res) => {
    try {
      const sosyalMedyaListesi = await SosyalMedya.find();
      res.json(sosyalMedyaListesi);
    } catch (err) {
      logger.error("Sosyal medya listesi getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// Sosyal medya ekleme
router.post(
  "/",
  [
    auth,
    yetkiKontrol("sosyalmeyda_ekleme"),
    [
      check("kullaniciAdi", "Kullanıcı adı gereklidir").not().isEmpty(),
      check("tur", "Sosyal medya türü gereklidir").not().isEmpty(),
    ],
    validationErrorHandler,
  ],
  async (req, res) => {
    try {
      const yeniSosyalMedya = new SosyalMedya(req.body);
      await yeniSosyalMedya.save();
      res.json(yeniSosyalMedya);
    } catch (err) {
      logger.error("Sosyal medya eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// Sosyal medya güncelleme
router.put(
  "/:id",
  [
    auth,
    yetkiKontrol("sosyalmeyda_guncelleme"),
    [
      check("kullaniciAdi", "Kullanıcı adı gereklidir").not().isEmpty(),
      check("tur", "Sosyal medya türü gereklidir").not().isEmpty(),
    ],
    validationErrorHandler,
  ],
  async (req, res) => {
    try {
      const guncellenenSosyalMedya = await SosyalMedya.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(guncellenenSosyalMedya);
    } catch (err) {
      logger.error("Sosyal medya güncellenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// Sosyal medya silme
router.delete(
  "/:id",
  auth,
  yetkiKontrol("sosyalmeyda_silme"),
  async (req, res) => {
    try {
      await SosyalMedya.findByIdAndDelete(req.params.id);
      res.json({ msg: "Sosyal medya silindi" });
    } catch (err) {
      logger.error("Sosyal medya silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
