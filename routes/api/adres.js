const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");

const Adres = require("../../models/Adres");

// @route   GET api/adres
// @desc    Tüm adresleri getir
// @access  Özel
router.get("/", auth, yetkiKontrol("adres_goruntuleme"), async (req, res) => {
  try {
    const adresler = await Adres.find().sort({ kayitTarihi: -1 });
    res.json(adresler);
  } catch (err) {
    logger.error("Tüm adresler getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/adres/:id
// @desc    ID'ye göre adres getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("adres_goruntuleme"),
  async (req, res) => {
    try {
      const adres = await Adres.findById(req.params.id);

      if (!adres) {
        return res.status(404).json({ msg: "Adres bulunamadı" });
      }

      res.json(adres);
    } catch (err) {
      logger.error("Adres getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Adres bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/adres/referans/:tip/:id
// @desc    Referans türü ve ID'ye göre adresleri getir
// @access  Özel
router.get(
  "/referans/:tip/:id",
  auth,
  yetkiKontrol("adres_goruntuleme"),
  async (req, res) => {
    try {
      const adresler = await Adres.find({
        referans_turu: req.params.tip,
        referans_id: req.params.id,
      }).sort({ kayitTarihi: -1 });

      res.json(adresler);
    } catch (err) {
      logger.error("Referansa göre adresler getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/adres
// @desc    Yeni adres ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("adres_ekleme"),
    [
      check("referans_turu", "Referans türü gereklidir").not().isEmpty(),
      check("referans_id", "Referans ID gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      referans_turu,
      referans_id,
      adres_turu,
      il,
      ilce,
      mahallekoy,
      sokak,
      apartman,
      daire,
      aciklama,
      adres_mernis,
      posta_kodu,
      isActive,
    } = req.body;

    try {
      const yeniAdres = new Adres({
        referans_turu,
        referans_id,
        adres_turu: adres_turu || "ev",
        il,
        ilce,
        mahallekoy,
        sokak,
        apartman,
        daire,
        aciklama,
        adres_mernis,
        posta_kodu,
        isActive: isActive !== undefined ? isActive : true,
      });

      const adres = await yeniAdres.save();
      res.json(adres);
    } catch (err) {
      logger.error("Adres eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/adres/:id
// @desc    Adres güncelle
// @access  Özel
router.put("/:id", auth, yetkiKontrol("adres_guncelleme"), async (req, res) => {
  const {
    adres_turu,
    il,
    ilce,
    mahallekoy,
    sokak,
    apartman,
    daire,
    aciklama,
    adres_mernis,
    posta_kodu,
    isActive,
  } = req.body;

  // Adres güncelleme nesnesini oluştur
  const adresGuncelleme = {};
  if (adres_turu) adresGuncelleme.adres_turu = adres_turu;
  if (il !== undefined) adresGuncelleme.il = il;
  if (ilce !== undefined) adresGuncelleme.ilce = ilce;
  if (mahallekoy !== undefined) adresGuncelleme.mahallekoy = mahallekoy;
  if (sokak !== undefined) adresGuncelleme.sokak = sokak;
  if (apartman !== undefined) adresGuncelleme.apartman = apartman;
  if (daire !== undefined) adresGuncelleme.daire = daire;
  if (aciklama !== undefined) adresGuncelleme.aciklama = aciklama;
  if (adres_mernis !== undefined) adresGuncelleme.adres_mernis = adres_mernis;
  if (posta_kodu !== undefined) adresGuncelleme.posta_kodu = posta_kodu;
  if (isActive !== undefined) adresGuncelleme.isActive = isActive;

  try {
    // Adres var mı kontrol et
    let adres = await Adres.findById(req.params.id);

    if (!adres) {
      return res.status(404).json({ msg: "Adres bulunamadı" });
    }

    // Güncelle
    adres = await Adres.findByIdAndUpdate(
      req.params.id,
      { $set: adresGuncelleme },
      { new: true }
    );

    res.json(adres);
  } catch (err) {
    logger.error("Adres güncellenirken hata", { error: err.message });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Adres bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

// @route   DELETE api/adres/:id
// @desc    Adres sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("adres_silme"), async (req, res) => {
  try {
    const adres = await Adres.findById(req.params.id);

    if (!adres) {
      return res.status(404).json({ msg: "Adres bulunamadı" });
    }

    await adres.remove();
    res.json({ msg: "Adres silindi" });
  } catch (err) {
    logger.error("Adres silinirken hata", { error: err.message });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Adres bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
