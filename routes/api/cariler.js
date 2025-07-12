const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const Cari = require("../../models/Cari");

// @route   GET api/cariler
// @desc    Tüm carileri getir
// @access  Özel
router.get("/", auth, yetkiKontrol("cariler_goruntuleme"), async (req, res) => {
  try {
    const cariler = await Cari.find().sort({ cariAd: 1 });
    res.json(cariler);
  } catch (err) {
    logger.error("Cariler getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/cariler/active
// @desc    Aktif carileri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("cariler_goruntuleme"),
  async (req, res) => {
    try {
      const cariler = await Cari.find({ isActive: true }).sort({ cariAd: 1 });
      res.json(cariler);
    } catch (err) {
      logger.error("Cariler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/cariler/tur/:tur
// @desc    Belirli türdeki carileri getir
// @access  Özel
router.get(
  "/tur/:tur",
  auth,
  yetkiKontrol("cariler_goruntuleme"),
  async (req, res) => {
    try {
      const cariler = await Cari.find({
        cariTur: req.params.tur,
        isActive: true,
      }).sort({ cariAd: 1 });
      res.json(cariler);
    } catch (err) {
      logger.error("Cariler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/cariler/:id
// @desc    ID'ye göre cari getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("cariler_goruntuleme"),
  async (req, res) => {
    try {
      const cari = await Cari.findById(req.params.id);

      if (!cari) {
        return res.status(404).json({ msg: "Cari bulunamadı" });
      }

      res.json(cari);
    } catch (err) {
      logger.error("Cari getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Cari bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/cariler
// @desc    Yeni cari ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("cariler_ekleme"),
    [check("cariAd", "Cari adı gereklidir").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      cariAd,
      aciklama,
      adres,
      telefon,
      webSitesi,
      faxNumarasi,
      epostaAdresi,
      il,
      ilce,
      vergiDairesi,
      vergiNo,
      cariTur,
      cariTur_id,
      isActive,
    } = req.body;

    try {
      // Aynı isimde cari var mı kontrol et
      const existingCari = await Cari.findOne({ cariAd });
      if (existingCari) {
        return res.status(400).json({ msg: "Bu isimde bir cari zaten mevcut" });
      }

      // Cari verilerini hazırla
      const cariData = {
        cariAd,
        aciklama,
        adres,
        telefon,
        webSitesi,
        faxNumarasi,
        epostaAdresi,
        il,
        ilce,
        vergiDairesi,
        vergiNo,
        cariTur,
        isActive: isActive !== undefined ? isActive : true,
      };

      // cariTur_id sadece geçerli bir değer ise ekle
      if (cariTur_id && cariTur_id !== "") {
        cariData.cariTur_id = cariTur_id;
      }

      // Yeni cari oluştur
      const cari = new Cari(cariData);

      await cari.save();
      res.json(cari);
    } catch (err) {
      logger.error("Cari eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/cariler/:id
// @desc    Cari bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("cariler_guncelleme"),
  async (req, res) => {
    const {
      cariAd,
      aciklama,
      adres,
      telefon,
      webSitesi,
      faxNumarasi,
      epostaAdresi,
      il,
      ilce,
      vergiDairesi,
      vergiNo,
      cariTur,
      cariTur_id,
      isActive,
    } = req.body;

    // Cari bilgilerini güncelleme
    const cariGuncelleme = {};
    if (cariAd) cariGuncelleme.cariAd = cariAd;
    if (aciklama !== undefined) cariGuncelleme.aciklama = aciklama;
    if (adres !== undefined) cariGuncelleme.adres = adres;
    if (telefon !== undefined) cariGuncelleme.telefon = telefon;
    if (webSitesi !== undefined) cariGuncelleme.webSitesi = webSitesi;
    if (faxNumarasi !== undefined) cariGuncelleme.faxNumarasi = faxNumarasi;
    if (epostaAdresi !== undefined) cariGuncelleme.epostaAdresi = epostaAdresi;
    if (il !== undefined) cariGuncelleme.il = il;
    if (ilce !== undefined) cariGuncelleme.ilce = ilce;
    if (vergiDairesi !== undefined) cariGuncelleme.vergiDairesi = vergiDairesi;
    if (vergiNo !== undefined) cariGuncelleme.vergiNo = vergiNo;
    if (cariTur !== undefined) cariGuncelleme.cariTur = cariTur;

    // cariTur_id alanı boş string ise null olarak ayarla, değilse değeri kullan
    if (cariTur_id !== undefined) {
      cariGuncelleme.cariTur_id = cariTur_id === "" ? null : cariTur_id;
    }

    if (isActive !== undefined) cariGuncelleme.isActive = isActive;

    try {
      // Cari var mı kontrolü
      let cari = await Cari.findById(req.params.id);

      if (!cari) {
        return res.status(404).json({ msg: "Cari bulunamadı" });
      }

      // Aynı isimde başka bir cari var mı kontrol et
      if (cariAd && cariAd !== cari.cariAd) {
        const existingCari = await Cari.findOne({ cariAd });
        if (existingCari) {
          return res
            .status(400)
            .json({ msg: "Bu isimde bir cari zaten mevcut" });
        }
      }

      // Güncelleme yap
      cari = await Cari.findByIdAndUpdate(
        req.params.id,
        { $set: cariGuncelleme },
        { new: true }
      );

      res.json(cari);
    } catch (err) {
      logger.error("Cari güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Cari bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/cariler/:id
// @desc    Cari sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("cariler_silme"), async (req, res) => {
  try {
    // Cari var mı kontrolü
    const cari = await Cari.findById(req.params.id);

    if (!cari) {
      return res.status(404).json({ msg: "Cari bulunamadı" });
    }

    // Cariyi sil
    await cari.remove();
    res.json({ msg: "Cari silindi" });
  } catch (err) {
    logger.error("Cari silinirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cari bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/cariler/delete-many
// @desc    Birden fazla cari sil
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("cariler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // Toplu silme işlemi için
      const result = await Cari.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: "Silinecek cari bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet cari silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Cariler silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
