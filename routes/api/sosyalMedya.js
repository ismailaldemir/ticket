const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const SosyalMedya = require("../../models/SosyalMedya");

// @route   GET api/sosyal-medya
// @desc    Tüm sosyal medya hesaplarını getir
// @access  Özel
router.get("/", auth, async (req, res) => {
  try {
    const sosyalMedyalar = await SosyalMedya.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(sosyalMedyalar);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/sosyal-medya/:id
// @desc    ID'ye göre sosyal medya hesabı getir
// @access  Özel
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined" || id === "null") {
    return res.status(400).json({ msg: "Geçersiz sosyal medya ID" });
  }
  try {
    const sosyalMedya = await SosyalMedya.findByPk(id);
    if (!sosyalMedya) {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }
    res.json(sosyalMedya);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/sosyal-medya/referans/:tip/:id
// @desc    Referans türü ve ID'ye göre sosyal medya hesaplarını getir
// @access  Özel
router.get("/referans/:tip/:id", auth, async (req, res) => {
  try {
    const sosyalMedyalar = await SosyalMedya.findAll({
      where: {
        referansTur: req.params.tip,
        referansId: req.params.id,
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(sosyalMedyalar);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/sosyal-medya/referans/:referansTur/:referansId
// @desc    Referans türü ve ID'ye göre sosyal medya hesaplarını getir
// @access  Özel
router.get("/referans/:referansTur/:referansId", auth, async (req, res) => {
  try {
    const { referansTur, referansId } = req.params;

    // Referans türü validasyonu
    if (!["Kisi", "Organizasyon"].includes(referansTur)) {
      return res.status(400).json({ msg: "Geçersiz referans türü" });
    }

    const sosyalMedyalar = await SosyalMedya.findAll({
      where: {
        referansId: referansId,
        referansTur: referansTur,
        isActive: true,
      },
      order: [
        ["tur", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json(sosyalMedyalar);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/sosyal-medya
// @desc    Yeni sosyal medya hesabı ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    [
      check("referansTur", "Referans türü gereklidir").not().isEmpty(),
      check("referansId", "Referans ID gereklidir").not().isEmpty(),
      check("tur", "Sosyal medya türü gereklidir").not().isEmpty(),
      check("kullaniciAdi", "Kullanıcı adı gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        referansTur,
        referansId,
        tur,
        kullaniciAdi,
        url,
        aciklama,
        durumu,
      } = req.body;
      const sosyalMedya = await SosyalMedya.create({
        referansTur,
        referansId,
        tur,
        kullaniciAdi,
        url,
        aciklama,
        durumu: durumu || "Aktif",
      });
      res.json(sosyalMedya);
    } catch (err) {
      console.error("Sosyal medya kayıt hatası:", err);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/sosyal-medya/:id
// @desc    Sosyal medya hesabını güncelle
// @access  Özel
router.put("/:id", auth, async (req, res) => {
  const { medya_turu, deger, aciklama, isActive } = req.body;
  const sosyalMedyaGuncelleme = {};
  if (medya_turu) sosyalMedyaGuncelleme.medya_turu = medya_turu;
  if (deger) sosyalMedyaGuncelleme.deger = deger;
  if (aciklama !== undefined) sosyalMedyaGuncelleme.aciklama = aciklama;
  if (isActive !== undefined) sosyalMedyaGuncelleme.isActive = isActive;
  try {
    let sosyalMedya = await SosyalMedya.findByPk(req.params.id);
    if (!sosyalMedya) {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }
    await sosyalMedya.update(sosyalMedyaGuncelleme);
    res.json(sosyalMedya);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

// @route   DELETE api/sosyal-medya/:id
// @desc    Sosyal medya hesabını sil
// @access  Özel
router.delete("/:id", auth, async (req, res) => {
  try {
    const sosyalMedya = await SosyalMedya.findByPk(req.params.id);
    if (!sosyalMedya) {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }
    await sosyalMedya.destroy();
    res.json({ msg: "Sosyal medya hesabı silindi" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
