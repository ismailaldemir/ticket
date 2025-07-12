const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");

const Email = require("../../models/Email");
const Kisi = require("../../models/Kisi");
const Organizasyon = require("../../models/Organizasyon");
const Sube = require("../../models/Sube");

// @route   GET api/emails
// @desc    Tüm e-posta adreslerini getir
// @access  Özel
router.get("/", auth, yetkiKontrol("emails_goruntuleme"), async (req, res) => {
  try {
    const emails = await Email.find().sort({ kayitTarihi: -1 });
    res.json(emails);
  } catch (err) {
    logger.error("E-postalar getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/emails/kisi/:kisi_id
// @desc    Kişiye ait e-posta adreslerini getir
// @access  Özel
router.get(
  "/kisi/:kisi_id",
  auth,
  yetkiKontrol("emails_goruntuleme"),
  async (req, res) => {
    try {
      const emails = await Email.find({
        referansTur: "Kisi",
        referansId: req.params.kisi_id,
      }).sort({ varsayilan: -1, kayitTarihi: -1 });

      res.json(emails);
    } catch (err) {
      logger.error("Kişiye ait e-postalar getirilirken hata", {
        error: err.message,
      });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/emails/organizasyon/:organizasyon_id
// @desc    Organizasyona ait e-posta adreslerini getir
// @access  Özel
router.get(
  "/organizasyon/:organizasyon_id",
  auth,
  yetkiKontrol("emails_goruntuleme"),
  async (req, res) => {
    try {
      const emails = await Email.find({
        referansTur: "Organizasyon",
        referansId: req.params.organizasyon_id,
      }).sort({ varsayilan: -1, kayitTarihi: -1 });

      res.json(emails);
    } catch (err) {
      logger.error("Organizasyona ait e-postalar getirilirken hata", {
        error: err.message,
      });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/emails/sube/:sube_id
// @desc    Şubeye ait e-posta adreslerini getir
// @access  Özel
router.get(
  "/sube/:sube_id",
  auth,
  yetkiKontrol("emails_goruntuleme"),
  async (req, res) => {
    try {
      const emails = await Email.find({
        referansTur: "Sube",
        referansId: req.params.sube_id,
      }).sort({ varsayilan: -1, kayitTarihi: -1 });

      res.json(emails);
    } catch (err) {
      logger.error("Şubeye ait e-postalar getirilirken hata", {
        error: err.message,
      });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/emails
// @desc    Yeni e-posta adresi ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("emails_ekleme"),
    [
      check("emailAdresi", "E-posta adresi gereklidir").not().isEmpty(),
      check("emailAdresi", "Geçerli bir e-posta adresi giriniz").isEmail(),
      check("referansTur", "Referans türü gereklidir").not().isEmpty(),
      check("referansId", "Referans ID gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      emailAdresi,
      referansTur,
      referansId,
      tur,
      aciklama,
      varsayilan,
      durumu,
    } = req.body;

    try {
      // Referans varlığını kontrol et
      if (referansTur === "Kisi") {
        const kisi = await Kisi.findById(referansId);
        if (!kisi) {
          return res.status(404).json({ msg: "Kişi bulunamadı" });
        }
      } else if (referansTur === "Organizasyon") {
        const organizasyon = await Organizasyon.findById(referansId);
        if (!organizasyon) {
          return res.status(404).json({ msg: "Organizasyon bulunamadı" });
        }
      } else if (referansTur === "Sube") {
        const sube = await Sube.findById(referansId);
        if (!sube) {
          return res.status(404).json({ msg: "Şube bulunamadı" });
        }
      } else {
        return res.status(400).json({ msg: "Geçersiz referans türü" });
      }

      // Aynı referans ve e-posta adresi ile kayıt var mı kontrolü
      const mevcutEmail = await Email.findOne({
        emailAdresi,
        referansTur,
        referansId,
      });

      if (mevcutEmail) {
        return res.status(400).json({
          msg: "Bu e-posta adresi zaten kayıtlı",
        });
      }

      // Varsayılan olarak işaretlendiyse diğer varsayılanları kaldır
      if (varsayilan) {
        await Email.updateMany(
          { referansTur, referansId, varsayilan: true },
          { $set: { varsayilan: false } }
        );
      }

      // Yeni e-posta adresi oluştur
      const yeniEmail = new Email({
        emailAdresi,
        referansTur,
        referansId,
        tur: tur || "İş",
        aciklama,
        varsayilan: varsayilan || false,
        durumu: durumu || "Aktif",
      });

      const email = await yeniEmail.save();
      res.json(email);
    } catch (err) {
      logger.error("E-posta eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/emails/:id
// @desc    E-posta adresi güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("emails_guncelleme"),
  async (req, res) => {
    const { emailAdresi, tur, aciklama, varsayilan, durumu, dogrulandi } =
      req.body;

    // E-posta güncelleme objesi
    const emailGuncelleme = {};
    if (emailAdresi) emailGuncelleme.emailAdresi = emailAdresi;
    if (tur) emailGuncelleme.tur = tur;
    if (aciklama !== undefined) emailGuncelleme.aciklama = aciklama;
    if (varsayilan !== undefined) emailGuncelleme.varsayilan = varsayilan;
    if (durumu) emailGuncelleme.durumu = durumu;
    if (dogrulandi !== undefined) {
      emailGuncelleme.dogrulandi = dogrulandi;
      if (dogrulandi) {
        emailGuncelleme.dogrulamaTarihi = Date.now();
      }
    }
    emailGuncelleme.guncellenmeTarihi = Date.now();

    try {
      // E-posta kaydı var mı kontrolü
      let email = await Email.findById(req.params.id);

      if (!email) {
        return res.status(404).json({ msg: "E-posta adresi bulunamadı" });
      }

      // Varsayılan olarak işaretlendiyse diğer varsayılanları kaldır
      if (varsayilan) {
        await Email.updateMany(
          {
            referansTur: email.referansTur,
            referansId: email.referansId,
            varsayilan: true,
            _id: { $ne: req.params.id },
          },
          { $set: { varsayilan: false } }
        );
      }

      // Güncelleme yap
      email = await Email.findByIdAndUpdate(
        req.params.id,
        { $set: emailGuncelleme },
        { new: true }
      );

      res.json(email);
    } catch (err) {
      logger.error("E-posta güncellenirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "E-posta adresi bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/emails/:id
// @desc    E-posta adresi sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("emails_silme"), async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ msg: "E-posta adresi bulunamadı" });
    }

    await email.remove();
    res.json({ msg: "E-posta adresi silindi" });
  } catch (err) {
    logger.error("E-posta silinirken hata", { error: err.message });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "E-posta adresi bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

// @route   DELETE api/emails/all/:referansTur/:referansId
// @desc    Belirli bir referansa ait tüm e-posta adreslerini sil
// @access  Özel
router.delete(
  "/all/:referansTur/:referansId",
  auth,
  yetkiKontrol("emails_silme"),
  async (req, res) => {
    try {
      const { referansTur, referansId } = req.params;

      const result = await Email.deleteMany({
        referansTur,
        referansId,
      });

      res.json({
        msg: `${result.deletedCount} e-posta adresi silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Belirli bir referansa ait e-postalar silinirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
