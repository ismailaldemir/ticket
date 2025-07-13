const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check } = require("express-validator");
const validationErrorHandler = require("../../middleware/validationErrorHandler");
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
    const subeler = await Sube.findAll({
      include: [
        { model: Organizasyon, as: "organizasyon", attributes: ["ad"] },
      ],
      order: [["ad", "ASC"]],
    });
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
      const subeler = await Sube.findAll({
        where: { isActive: true },
        include: [
          { model: Organizasyon, as: "organizasyon", attributes: ["ad"] },
        ],
        order: [["ad", "ASC"]],
      });
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
    const { organizasyon_id } = req.params;
    if (
      !organizasyon_id ||
      organizasyon_id === "undefined" ||
      organizasyon_id === "null"
    ) {
      return res.status(400).json({ msg: "Geçersiz organizasyon ID" });
    }
    try {
      const subeler = await Sube.findAll({
        where: { organizasyon_id: organizasyon_id, isActive: true },
        include: [
          { model: Organizasyon, as: "organizasyon", attributes: ["ad"] },
        ],
        order: [["ad", "ASC"]],
      });
      res.json(subeler);
    } catch (err) {
      logger.error("Organizasyona göre şubeler getirilirken hata", {
        error: err.message,
      });
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
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ msg: "Geçersiz şube ID" });
    }
    try {
      const sube = await Sube.findByPk(id, {
        include: [
          { model: Organizasyon, as: "organizasyon", attributes: ["ad"] },
        ],
      });

      if (!sube) {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }

      res.json(sube);
    } catch (err) {
      logger.error("Şube getirilirken hata", { error: err.message });
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
    validationErrorHandler,
  ],
  async (req, res) => {
    const { ad, organizasyon_id, aciklama, iletisimBilgileri, isActive } =
      req.body;
    try {
      // Organizasyon var mı kontrolü
      const organizasyon = await Organizasyon.findByPk(organizasyon_id);
      if (!organizasyon) {
        return res
          .status(404)
          .json({ msg: "Belirtilen organizasyon bulunamadı" });
      }

      // Aynı organizasyonda aynı isimde şube var mı kontrol et
      const existingSube = await Sube.findOne({
        where: { ad, organizasyon_id },
      });
      if (existingSube) {
        return res
          .status(400)
          .json({ msg: "Bu isimde bir şube bu organizasyonda zaten mevcut" });
      }

      // Yeni şube oluştur
      const sube = await Sube.create({
        ad,
        organizasyon_id,
        aciklama,
        iletisimBilgileri,
        isActive: isActive !== undefined ? isActive : true,
      });

      // Fetch the created sube with its organization
      const populatedSube = await Sube.findByPk(sube.id, {
        include: [
          { model: Organizasyon, as: "organizasyon", attributes: ["ad"] },
        ],
      });
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
  [
    auth,
    yetkiKontrol("subeler_guncelleme"),
    [
      check("ad", "Şube adı gereklidir").not().isEmpty(),
      check("organizasyon_id", "Organizasyon ID gereklidir").not().isEmpty(),
    ],
    validationErrorHandler,
  ],
  async (req, res) => {
    const { ad, organizasyon_id, aciklama, iletisimBilgileri, isActive } =
      req.body;
    const subeGuncelleme = {};
    if (ad) subeGuncelleme.ad = ad;
    if (organizasyon_id) subeGuncelleme.organizasyon_id = organizasyon_id;
    if (aciklama !== undefined) subeGuncelleme.aciklama = aciklama;
    if (iletisimBilgileri) subeGuncelleme.iletisimBilgileri = iletisimBilgileri;
    if (isActive !== undefined) subeGuncelleme.isActive = isActive;
    try {
      // Şube var mı kontrolü
      let sube = await Sube.findByPk(req.params.id);
      if (!sube) {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }
      // Organizasyon değişiyorsa, organizasyon var mı kontrolü
      if (organizasyon_id && organizasyon_id !== String(sube.organizasyon_id)) {
        const organizasyon = await Organizasyon.findByPk(organizasyon_id);
        if (!organizasyon) {
          return res
            .status(404)
            .json({ msg: "Belirtilen organizasyon bulunamadı" });
        }
      }
      // Aynı isimde başka bir şube var mı kontrol et (isim veya organizasyon değişiyorsa)
      if (
        (ad && ad !== sube.ad) ||
        (organizasyon_id && organizasyon_id !== String(sube.organizasyon_id))
      ) {
        const existingSube = await Sube.findOne({
          where: { ad, organizasyon_id },
        });
        if (existingSube && existingSube.id !== sube.id) {
          return res
            .status(400)
            .json({ msg: "Bu isimde bir şube bu organizasyonda zaten mevcut" });
        }
      }
      // Güncelleme
      await sube.update(subeGuncelleme);
      // Fetch updated with organization
      const updatedSube = await Sube.findByPk(sube.id, {
        include: [
          { model: Organizasyon, as: "organizasyon", attributes: ["ad"] },
        ],
      });
      res.json(updatedSube);
    } catch (err) {
      logger.error("Şube güncellenirken hata", { error: err.message });
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
    const sube = await Sube.findByPk(req.params.id);
    if (!sube) {
      return res.status(404).json({ msg: "Şube bulunamadı" });
    }

    // Şubeye bağlı kişiler var mı kontrolü
    const kisiler = await Kisi.count({ where: { sube_id: req.params.id } });
    if (kisiler > 0) {
      return res.status(400).json({
        msg: "Bu şube silinemiyor, çünkü bu şubeye ait kişiler var",
        count: kisiler,
      });
    }

    // Şubeyi sil
    await sube.destroy();
    res.json({ msg: "Şube silindi" });
  } catch (err) {
    logger.error("Şube silinirken hata", { error: err.message });
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

      // Şubelere bağlı kişileri kontrol et
      for (const id of ids) {
        const kisiCount = await Kisi.count({ where: { sube_id: id } });
        if (kisiCount > 0) {
          return res.status(400).json({
            msg: `Seçili şubelere bağlı kişiler var. Önce bu şubelerdeki kişileri başka şubelere taşımalısınız.`,
            subeId: id,
            count: kisiCount,
          });
        }
      }

      // Toplu silme işlemi için
      const deletedCount = await Sube.destroy({ where: { id: ids } });
      if (deletedCount === 0) {
        return res.status(404).json({ msg: "Silinecek şube bulunamadı" });
      }

      res.json({
        msg: `${deletedCount} adet şube silindi`,
        count: deletedCount,
      });
    } catch (err) {
      logger.error("Birden fazla şube silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
