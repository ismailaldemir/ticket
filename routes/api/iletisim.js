const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");
const Telefon = require("../../models/Telefon");
const Adres = require("../../models/Adres");
const SosyalMedya = require("../../models/SosyalMedya");

// @route   GET api/iletisim/telefon/:referansTur/:referansId
// @desc    Get all telefon numbers for a reference
// @access  Private
router.get(
  "/telefon/:referansTur/:referansId",
  auth,
  yetkiKontrol("iletisim_goruntuleme"),
  async (req, res) => {
    try {
      const telefonlar = await Telefon.find({
        referansId: req.params.referansId,
        referansTur: req.params.referansTur,
      }).sort("-createdAt");

      res.json(telefonlar);
    } catch (err) {
      logger.error("Telefonlar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/iletisim/telefon
// @desc    Add new telefon
// @access  Private
router.post(
  "/telefon",
  auth,
  yetkiKontrol("iletisim_ekleme"),
  async (req, res) => {
    try {
      const yeniTelefon = new Telefon({
        ...req.body,
        user: req.user.id,
      });

      const telefon = await yeniTelefon.save();
      res.json(telefon);
    } catch (err) {
      logger.error("Telefon eklenirken hata", { error: err.message });
      if (err.name === "ValidationError") {
        return res.status(400).json({ msg: err.message });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/iletisim/telefon/:id
// @desc    Update telefon
// @access  Private
router.put(
  "/telefon/:id",
  auth,
  yetkiKontrol("iletisim_guncelleme"),
  async (req, res) => {
    try {
      let telefon = await Telefon.findById(req.params.id);
      if (!telefon) {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }

      const { telefonNumarasi, tur, aciklama, durumu } = req.body;

      // Güncelleme verisini hazırla
      const telefonUpdate = {
        telefonNumarasi,
        tur,
        aciklama,
        durumu,
      };

      // Telefonu güncelle
      telefon = await Telefon.findByIdAndUpdate(
        req.params.id,
        { $set: telefonUpdate },
        { new: true }
      );

      res.json(telefon);
    } catch (err) {
      logger.error("Telefon güncelleme hatası", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/iletisim/telefon/:id
// @desc    Delete telefon
// @access  Private
router.delete(
  "/telefon/:id",
  auth,
  yetkiKontrol("iletisim_silme"),
  async (req, res) => {
    try {
      const telefon = await Telefon.findById(req.params.id);

      if (!telefon) {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }

      await telefon.remove();
      res.json({ msg: "Telefon silindi", id: req.params.id });
    } catch (err) {
      logger.error("Telefon silme hatası", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// Adres Routes
// @route   GET api/iletisim/adres/:referansTur/:referansId
// @desc    Get all addresses for a reference
// @access  Private
router.get(
  "/adres/:referansTur/:referansId",
  auth,
  yetkiKontrol("iletisim_goruntuleme"),
  async (req, res) => {
    try {
      const adresler = await Adres.find({
        referansId: req.params.referansId,
        referansTur: req.params.referansTur,
      }).sort("-createdAt");

      res.json(adresler);
    } catch (err) {
      logger.error("Adresler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/iletisim/adres
// @desc    Add new address
// @access  Private
router.post(
  "/adres",
  auth,
  yetkiKontrol("iletisim_ekleme"),
  async (req, res) => {
    try {
      const yeniAdres = new Adres({
        ...req.body,
        user: req.user.id,
      });

      const adres = await yeniAdres.save();
      res.json(adres);
    } catch (err) {
      logger.error("Adres eklenirken hata", { error: err.message });
      if (err.name === "ValidationError") {
        return res.status(400).json({ msg: err.message });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/iletisim/adres/:id
// @desc    Update address
// @access  Private
router.put(
  "/adres/:id",
  auth,
  yetkiKontrol("iletisim_guncelleme"),
  async (req, res) => {
    try {
      let adres = await Adres.findById(req.params.id);

      if (!adres) {
        return res.status(404).json({ msg: "Adres bulunamadı" });
      }

      // Güncelleme verisi
      const adresUpdate = {
        adres: req.body.adres,
        il: req.body.il,
        ilce: req.body.ilce,
        postaKodu: req.body.postaKodu,
        ulke: req.body.ulke || "Türkiye",
        tur: req.body.tur || "İş",
        lokasyon: req.body.lokasyon,
        aciklama: req.body.aciklama,
        varsayilan: req.body.varsayilan || false,
        durumu: req.body.durumu || "Aktif",
      };

      // Varsayılan adres işaretlendiyse diğerlerini güncelle
      if (adresUpdate.varsayilan) {
        await Adres.updateMany(
          {
            referansId: adres.referansId,
            referansTur: adres.referansTur,
            _id: { $ne: adres._id },
            varsayilan: true,
          },
          { $set: { varsayilan: false } }
        );
      }

      adres = await Adres.findByIdAndUpdate(
        req.params.id,
        { $set: adresUpdate },
        { new: true }
      );

      res.json(adres);
    } catch (err) {
      logger.error("Adres güncelleme hatası", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Adres bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/iletisim/adres/:id
// @desc    Delete address
// @access  Private
router.delete(
  "/adres/:id",
  auth,
  yetkiKontrol("iletisim_silme"),
  async (req, res) => {
    try {
      const adres = await Adres.findById(req.params.id);
      if (!adres) return res.status(404).json({ msg: "Adres bulunamadı" });

      await adres.remove();
      res.json({ msg: "Adres silindi" });
    } catch (err) {
      logger.error("Adres silme hatası", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Adres bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// Sosyal Medya Routes
// @route   GET api/iletisim/sosyal-medya/:referansTur/:referansId
// @desc    Get all social media accounts for a reference
// @access  Private
router.get(
  "/sosyal-medya/:referansTur/:referansId",
  auth,
  yetkiKontrol("iletisim_goruntuleme"),
  async (req, res) => {
    try {
      const sosyalMedyalar = await SosyalMedya.find({
        referansId: req.params.referansId,
        referansTur: req.params.referansTur,
      }).sort("-createdAt");

      res.json(sosyalMedyalar);
    } catch (err) {
      logger.error("Sosyal medya hesapları getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/iletisim/sosyal-medya
// @desc    Add new social media account
// @access  Private
router.post(
  "/sosyal-medya",
  auth,
  yetkiKontrol("iletisim_ekleme"),
  async (req, res) => {
    try {
      const yeniSosyalMedya = new SosyalMedya({
        ...req.body,
        user: req.user.id,
      });

      const sosyalMedya = await yeniSosyalMedya.save();
      res.json(sosyalMedya);
    } catch (err) {
      logger.error("Sosyal medya hesabı eklenirken hata", {
        error: err.message,
      });
      if (err.name === "ValidationError") {
        return res.status(400).json({ msg: err.message });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/iletisim/sosyal-medya/:id
// @desc    Update social media account
// @access  Private
router.put(
  "/sosyal-medya/:id",
  auth,
  yetkiKontrol("iletisim_guncelleme"),
  async (req, res) => {
    try {
      let sosyalMedya = await SosyalMedya.findById(req.params.id);
      if (!sosyalMedya)
        return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });

      sosyalMedya = await SosyalMedya.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.json(sosyalMedya);
    } catch (err) {
      logger.error("Sosyal medya hesabı güncellenirken hata", {
        error: err.message,
      });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/iletisim/sosyal-medya/:id
// @desc    Delete social media account
// @access  Private
router.delete(
  "/sosyal-medya/:id",
  auth,
  yetkiKontrol("iletisim_silme"),
  async (req, res) => {
    try {
      const sosyalMedya = await SosyalMedya.findById(req.params.id);
      if (!sosyalMedya)
        return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });

      await sosyalMedya.remove();
      res.json({ msg: "Sosyal medya hesabı silindi" });
    } catch (err) {
      logger.error("Sosyal medya hesabı silinirken hata", {
        error: err.message,
      });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
