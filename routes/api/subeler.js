const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const Sube = require("../../models/Sube");
const Organizasyon = require("../../models/Organizasyon");
const Kisi = require("../../models/Kisi");

// @route   GET api/subeler
// @desc    Tüm şubeleri getir
// @access  Özel
router.get("/", auth, yetkiKontrol("subeler_goruntuleme"), async (req, res) => {
  try {
    const subeler = await Sube.find()
      .populate("organizasyon_id", ["ad"])
      .sort({ ad: 1 });
    res.json(subeler);
  } catch (err) {
    logger.error("Şubeler getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/subeler/active
// @desc    Aktif şubeleri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("subeler_goruntuleme"),
  async (req, res) => {
    try {
      const subeler = await Sube.find({ isActive: true })
        .populate("organizasyon_id", ["ad"])
        .sort({ ad: 1 });
      res.json(subeler);
    } catch (err) {
      logger.error("Aktif şubeler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/subeler/organizasyon/:organizasyon_id
// @desc    Organizasyona göre şubeleri getir
// @access  Özel
router.get(
  "/organizasyon/:organizasyon_id",
  auth,
  yetkiKontrol("subeler_goruntuleme"),
  async (req, res) => {
    try {
      const subeler = await Sube.find({
        organizasyon_id: req.params.organizasyon_id,
        isActive: true,
      })
        .populate("organizasyon_id", ["ad"])
        .sort({ ad: 1 });
      res.json(subeler);
    } catch (err) {
      logger.error("Organizasyona göre şubeler getirilirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/subeler/:id
// @desc    ID'ye göre şube getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("subeler_goruntuleme"),
  async (req, res) => {
    try {
      const sube = await Sube.findById(req.params.id).populate(
        "organizasyon_id",
        ["ad"]
      );

      if (!sube) {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }

      res.json(sube);
    } catch (err) {
      logger.error("Şube getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/subeler
// @desc    Yeni şube ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("subeler_ekleme"),
    [
      check("ad", "Şube adı gereklidir").not().isEmpty(),
      check("organizasyon_id", "Organizasyon ID gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ad, organizasyon_id, aciklama, iletisimBilgileri, isActive } =
      req.body;

    try {
      // Organizasyon var mı kontrolü
      const organizasyon = await Organizasyon.findById(organizasyon_id);
      if (!organizasyon) {
        return res
          .status(404)
          .json({ msg: "Belirtilen organizasyon bulunamadı" });
      }

      // Aynı organizasyonda aynı isimde şube var mı kontrol et
      const existingSube = await Sube.findOne({
        ad,
        organizasyon_id,
      });

      if (existingSube) {
        return res
          .status(400)
          .json({ msg: "Bu isimde bir şube bu organizasyonda zaten mevcut" });
      }

      // Yeni şube oluştur
      const sube = new Sube({
        ad,
        organizasyon_id,
        aciklama,
        iletisimBilgileri,
        isActive: isActive !== undefined ? isActive : true,
      });

      await sube.save();

      // İlişkilendirmeyi otomatik yapalım
      const populatedSube = await Sube.findById(sube._id).populate(
        "organizasyon_id",
        ["ad"]
      );

      res.json(populatedSube);
    } catch (err) {
      logger.error("Şube eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/subeler/:id
// @desc    Şube bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("subeler_guncelleme"),
  async (req, res) => {
    const { ad, organizasyon_id, aciklama, iletisimBilgileri, isActive } =
      req.body;

    // Şube bilgilerini güncelleme
    const subeGuncelleme = {};
    if (ad) subeGuncelleme.ad = ad;
    if (organizasyon_id) subeGuncelleme.organizasyon_id = organizasyon_id;
    if (aciklama !== undefined) subeGuncelleme.aciklama = aciklama;
    if (iletisimBilgileri) subeGuncelleme.iletisimBilgileri = iletisimBilgileri;
    if (isActive !== undefined) subeGuncelleme.isActive = isActive;

    try {
      // Şube var mı kontrolü
      let sube = await Sube.findById(req.params.id);

      if (!sube) {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }

      // Organizasyon değişiyorsa, organizasyon var mı kontrolü
      if (
        organizasyon_id &&
        organizasyon_id !== sube.organizasyon_id.toString()
      ) {
        const organizasyon = await Organizasyon.findById(organizasyon_id);
        if (!organizasyon) {
          return res
            .status(404)
            .json({ msg: "Belirtilen organizasyon bulunamadı" });
        }
      }

      // Aynı isimde başka bir şube var mı kontrol et (isim veya organizasyon değişiyorsa)
      if (
        (ad && ad !== sube.ad) ||
        (organizasyon_id && organizasyon_id !== sube.organizasyon_id.toString())
      ) {
        const checkOrganizasyonId = organizasyon_id || sube.organizasyon_id;
        const checkAd = ad || sube.ad;

        const existingSube = await Sube.findOne({
          ad: checkAd,
          organizasyon_id: checkOrganizasyonId,
          _id: { $ne: req.params.id },
        });

        if (existingSube) {
          return res
            .status(400)
            .json({ msg: "Bu isimde bir şube bu organizasyonda zaten mevcut" });
        }
      }

      // Güncelleme yap
      sube = await Sube.findByIdAndUpdate(
        req.params.id,
        { $set: subeGuncelleme },
        { new: true }
      ).populate("organizasyon_id", ["ad"]);

      res.json(sube);
    } catch (err) {
      logger.error("Şube güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/subeler/:id
// @desc    Şube sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("subeler_silme"), async (req, res) => {
  try {
    // Şube var mı kontrolü
    const sube = await Sube.findById(req.params.id);

    if (!sube) {
      return res.status(404).json({ msg: "Şube bulunamadı" });
    }

    // Şubeye bağlı kişiler var mı kontrolü
    const kisiler = await Kisi.countDocuments({ sube_id: req.params.id });

    if (kisiler > 0) {
      return res.status(400).json({
        msg: "Bu şube silinemiyor, çünkü bu şubeye ait kişiler var",
        count: kisiler,
      });
    }

    // Şubeyi sil
    await sube.remove();
    res.json({ msg: "Şube silindi" });
  } catch (err) {
    logger.error("Şube silinirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Şube bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/subeler/delete-many
// @desc    Birden fazla şube sil
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("subeler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // Şubelere bağlı kasaları kontrol et
      for (const id of ids) {
        const kasaCount = await mongoose
          .model("kasa")
          .countDocuments({ sube_id: id });
        if (kasaCount > 0) {
          return res.status(400).json({
            msg: `Seçili şubelere bağlı kasalar var. Önce bu kasaları silmeniz gerekiyor.`,
            subeId: id,
            count: kasaCount,
          });
        }

        // Şubelere bağlı kişileri kontrol et
        const kisiCount = await mongoose
          .model("kisi")
          .countDocuments({ sube_id: id });
        if (kisiCount > 0) {
          return res.status(400).json({
            msg: `Seçili şubelere bağlı kişiler var. Önce bu şubelerdeki kişileri başka şubelere taşımalısınız.`,
            subeId: id,
            count: kisiCount,
          });
        }
      }

      // Toplu silme işlemi için
      const result = await Sube.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: "Silinecek şube bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet şube silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Birden fazla şube silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
