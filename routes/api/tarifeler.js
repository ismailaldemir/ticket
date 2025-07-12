const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Tarife = require("../../models/Tarife");
const Ucret = require("../../models/Ucret");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

// @route   GET api/tarifeler
// @desc    Tüm tarifeleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("tarifeler_goruntuleme"),
  async (req, res) => {
    try {
      const tarifeler = await Tarife.find().sort({ ad: 1 });
      res.json(tarifeler);
    } catch (err) {
      logger.error("Tarifeler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/tarifeler/active
// @desc    Aktif tarifeleri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("tarifeler_goruntuleme"),
  async (req, res) => {
    try {
      const tarifeler = await Tarife.find({ isActive: true }).sort({ ad: 1 });
      res.json(tarifeler);
    } catch (err) {
      logger.error("Aktif tarifeler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/tarifeler/:id
// @desc    ID'ye göre tarife getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("tarifeler_goruntuleme"),
  async (req, res) => {
    try {
      const tarife = await Tarife.findById(req.params.id);

      if (!tarife) {
        return res.status(404).json({ msg: "Tarife bulunamadı" });
      }

      res.json(tarife);
    } catch (err) {
      logger.error("Tarife getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Tarife bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/tarifeler
// @desc    Yeni tarife ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("tarifeler_ekleme"),
    [
      check("kod", "Tarife kodu gereklidir").not().isEmpty(),
      check("ad", "Tarife adı gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      kod,
      ad,
      aciklama,
      birimUcret,
      aylıkUcret,
      kullanilabilecekAlanlar,
      isActive,
    } = req.body;

    try {
      // Kod benzersiz mi kontrol et
      const existingTarife = await Tarife.findOne({ kod });
      if (existingTarife) {
        return res
          .status(400)
          .json({ msg: "Bu kod ile bir tarife zaten mevcut" });
      }

      // Yeni tarife oluştur
      const tarife = new Tarife({
        kod,
        ad,
        aciklama,
        birimUcret: birimUcret !== undefined ? birimUcret : false,
        aylıkUcret: aylıkUcret !== undefined ? aylıkUcret : false,
        kullanilabilecekAlanlar: kullanilabilecekAlanlar || {
          gelirler: true,
          giderler: false,
          borclar: true,
          odemeler: true,
        },
        isActive: isActive !== undefined ? isActive : true,
      });

      await tarife.save();
      res.json(tarife);
    } catch (err) {
      logger.error("Tarife eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/tarifeler/:id
// @desc    Tarife bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("tarifeler_guncelleme"),
  async (req, res) => {
    const {
      kod,
      ad,
      aciklama,
      birimUcret,
      aylıkUcret,
      kullanilabilecekAlanlar,
      isActive,
    } = req.body;

    // Tarife güncelleme objesi
    const tarifeGuncelleme = {};
    if (kod) tarifeGuncelleme.kod = kod;
    if (ad) tarifeGuncelleme.ad = ad;
    if (aciklama !== undefined) tarifeGuncelleme.aciklama = aciklama;
    if (birimUcret !== undefined) tarifeGuncelleme.birimUcret = birimUcret;
    if (aylıkUcret !== undefined) tarifeGuncelleme.aylıkUcret = aylıkUcret;
    if (kullanilabilecekAlanlar)
      tarifeGuncelleme.kullanilabilecekAlanlar = kullanilabilecekAlanlar;
    if (isActive !== undefined) tarifeGuncelleme.isActive = isActive;

    try {
      // Tarife var mı kontrolü
      let tarife = await Tarife.findById(req.params.id);

      if (!tarife) {
        return res.status(404).json({ msg: "Tarife bulunamadı" });
      }

      // Kod değişiyorsa ve yeni kod başka bir tarifede kullanılıyorsa hata ver
      if (kod && kod !== tarife.kod) {
        const existingTarife = await Tarife.findOne({
          kod,
          _id: { $ne: req.params.id },
        });

        if (existingTarife) {
          return res
            .status(400)
            .json({ msg: "Bu kod ile başka bir tarife zaten mevcut" });
        }
      }

      // Güncelleme yap
      tarife = await Tarife.findByIdAndUpdate(
        req.params.id,
        { $set: tarifeGuncelleme },
        { new: true }
      );

      res.json(tarife);
    } catch (err) {
      logger.error("Tarife güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Tarife bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/tarifeler/:id
// @desc    Tarife sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("tarifeler_silme"),
  async (req, res) => {
    try {
      const tarife = await Tarife.findById(req.params.id);

      if (!tarife) {
        return res.status(404).json({ msg: "Tarife bulunamadı" });
      }

      // İlişkili ücretleri kontrol et
      const ucretVarMi = await Ucret.findOne({ tarife_id: req.params.id });
      if (ucretVarMi) {
        return res.status(400).json({
          msg: "Bu tarifeye bağlı ücretler bulunduğu için silinemez. Önce ilişkili ücretleri silmeniz gerekiyor.",
        });
      }

      await tarife.remove();
      res.json({ msg: "Tarife silindi" });
    } catch (err) {
      logger.error("Tarife silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Tarife bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/tarifeler
// @desc    Çoklu tarife silme
// @access  Özel
router.delete("/", auth, yetkiKontrol("tarifeler_silme"), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ msg: "Silinecek tarifeler belirtilmedi" });
    }

    // Tarifelerinin ilişkili ücretlerle kontrolü
    for (const id of ids) {
      const ucret = await Ucret.findOne({ tarife_id: id });
      if (ucret) {
        const tarife = await Tarife.findById(id);
        return res.status(400).json({
          msg: `${
            tarife ? tarife.ad : "Seçilen tarife"
          } tarifesine ait ücretler olduğu için silme işlemi yapılamadı. Önce ilgili ücretleri siliniz.`,
        });
      }
    }

    // Tüm tarifeleri sil
    const result = await Tarife.deleteMany({ _id: { $in: ids } });

    res.json({
      msg: `${result.deletedCount} tarife başarıyla silindi`,
      deletedIds: ids,
    });
  } catch (err) {
    logger.error("Çoklu tarife silinirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/tarifeler/kullanim-alani/:alan
// @desc    Belirli bir alanda (gelirler, giderler vs.) kullanılabilecek tarifeleri getir
// @access  Özel
router.get(
  "/kullanim-alani/:alan",
  auth,
  yetkiKontrol("tarifeler_goruntuleme"),
  async (req, res) => {
    try {
      const { alan } = req.params;

      if (!["gelirler", "giderler", "borclar", "odemeler"].includes(alan)) {
        return res.status(400).json({ msg: "Geçersiz kullanım alanı" });
      }

      const filtreAnahtari = `kullanilabilecekAlanlar.${alan}`;

      const tarifeler = await Tarife.find({
        [filtreAnahtari]: true,
        isActive: true,
      }).sort({ ad: 1 });

      res.json(tarifeler);
    } catch (err) {
      logger.error("Belirli kullanım alanındaki tarifeler getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
