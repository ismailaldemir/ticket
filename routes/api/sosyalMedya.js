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
    const sosyalMedyalar = await SosyalMedya.find().sort({ kayitTarihi: -1 });
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
  try {
    const sosyalMedya = await SosyalMedya.findById(req.params.id);

    if (!sosyalMedya) {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }

    res.json(sosyalMedya);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/sosyal-medya/referans/:tip/:id
// @desc    Referans türü ve ID'ye göre sosyal medya hesaplarını getir
// @access  Özel
router.get("/referans/:tip/:id", auth, async (req, res) => {
  try {
    const sosyalMedyalar = await SosyalMedya.find({
      referans_turu: req.params.tip,
      referans_id: req.params.id,
    }).sort({ kayitTarihi: -1 });

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

    // Referans ID kontrolü
    if (!mongoose.Types.ObjectId.isValid(referansId)) {
      return res.status(400).json({ msg: "Geçersiz referans ID" });
    }

    const sosyalMedyalar = await SosyalMedya.find({
      referansId: referansId,
      referansTur: referansTur,
      isActive: true,
    }).sort({ tur: 1, createdAt: -1 });

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

      const yeniSosyalMedya = new SosyalMedya({
        referansTur,
        referansId,
        tur,
        kullaniciAdi,
        url,
        aciklama,
        durumu: durumu || "Aktif",
      });

      const sosyalMedya = await yeniSosyalMedya.save();
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

  // Sosyal medya güncelleme nesnesini oluştur
  const sosyalMedyaGuncelleme = {};
  if (medya_turu) sosyalMedyaGuncelleme.medya_turu = medya_turu;
  if (deger) sosyalMedyaGuncelleme.deger = deger;
  if (aciklama !== undefined) sosyalMedyaGuncelleme.aciklama = aciklama;
  if (isActive !== undefined) sosyalMedyaGuncelleme.isActive = isActive;

  try {
    // Sosyal medya var mı kontrol et
    let sosyalMedya = await SosyalMedya.findById(req.params.id);

    if (!sosyalMedya) {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }

    // Güncelle
    sosyalMedya = await SosyalMedya.findByIdAndUpdate(
      req.params.id,
      { $set: sosyalMedyaGuncelleme },
      { new: true }
    );

    res.json(sosyalMedya);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

// @route   DELETE api/sosyal-medya/:id
// @desc    Sosyal medya hesabını sil
// @access  Özel
router.delete("/:id", auth, async (req, res) => {
  try {
    const sosyalMedya = await SosyalMedya.findById(req.params.id);

    if (!sosyalMedya) {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }

    await sosyalMedya.remove();
    res.json({ msg: "Sosyal medya hesabı silindi" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
    }
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
