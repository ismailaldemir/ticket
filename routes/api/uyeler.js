const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");

const Uye = require("../../models/Uye");
const Kisi = require("../../models/Kisi");
const Sube = require("../../models/Sube");
const UyeRol = require("../../models/UyeRol");

// @route   GET api/uyeler
// @desc    Tüm üyeleri getir
// @access  Özel
router.get("/", auth, yetkiKontrol("uyeler_goruntuleme"), async (req, res) => {
  try {
    const uyeler = await Uye.findAll({
      include: [
        {
          model: Kisi,
          as: "kisi",
          attributes: ["ad", "soyad", "telefonNumarasi"],
        },
        {
          model: Sube,
          as: "sube",
          attributes: ["ad"],
        },
        {
          model: UyeRol,
          as: "uyeRol",
          attributes: ["ad"],
        },
      ],
      order: [["kayitTarihi", "DESC"]],
    });
    logger.info("Tüm üyeler getirildi", { count: uyeler.length });
    res.json(uyeler);
  } catch (err) {
    logger.error("Üyeler getirilirken hata", { error: err.message });
    res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
  }
});

// @route   GET api/uyeler/active
// @desc    Aktif üyeleri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("uyeler_goruntuleme"),
  async (req, res) => {
    try {
      const uyeler = await Uye.findAll({
        where: { isActive: true },
        include: [
          {
            model: Kisi,
            attributes: ["ad", "soyad", "telefonNumarasi"],
          },
          {
            model: Sube,
            attributes: ["ad"],
          },
          {
            model: UyeRol,
            attributes: ["ad"],
          },
        ],
        order: [["kayitTarihi", "DESC"]],
      });
      logger.info("Aktif üyeler getirildi", { count: uyeler.length });
      res.json(uyeler);
    } catch (err) {
      logger.error("Aktif üyeler getirilirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   GET api/uyeler/:id
// @desc    ID'ye göre üye getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("uyeler_goruntuleme"),
  async (req, res) => {
    try {
      const uye = await Uye.findById(req.params.id)
        .populate("kisi_id", [
          "ad",
          "soyad",
          "telefonNumarasi",
          "dogumYeri",
          "dogumTarihi",
          "cinsiyet",
        ])
        .populate("sube_id", ["ad"])
        .populate("uyeRol_id", ["ad"]);

      if (!uye) {
        logger.warn("Üye bulunamadı", { id: req.params.id });
        return res.status(404).json({ msg: "Üye bulunamadı" });
      }

      logger.info("Üye getirildi", { id: req.params.id });
      res.json(uye);
    } catch (err) {
      logger.error("Üye getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Üye bulunamadı" });
      }
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   GET api/uyeler/kisi/:kisi_id
// @desc    Kişiye göre üyeleri getir
// @access  Özel
router.get(
  "/kisi/:kisi_id",
  auth,
  yetkiKontrol("uyeler_goruntuleme"),
  async (req, res) => {
    try {
      const uyeler = await Uye.find({ kisi_id: req.params.kisi_id })
        .populate("kisi_id", ["ad", "soyad", "telefonNumarasi"])
        .populate("sube_id", ["ad"])
        .populate("uyeRol_id", ["ad"])
        .sort({ kayitTarihi: -1 });
      logger.info("Kişiye göre üyeler getirildi", {
        kisi_id: req.params.kisi_id,
        count: uyeler.length,
      });
      res.json(uyeler);
    } catch (err) {
      logger.error("Kişiye göre üyeler getirilirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   POST api/uyeler
// @desc    Yeni üye ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("uyeler_ekleme"),
    [
      check("kisi_id", "Kişi ID gereklidir").not().isEmpty(),
      check("uyeNo", "Üye numarası gereklidir").not().isEmpty(),
      check("sube_id", "Şube ID gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Üye ekleme doğrulama hatası", { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      kisi_id,
      uyeRol_id,
      uyeNo,
      sube_id,
      durumu,
      baslangicTarihi,
      bitisTarihi,
      kayitKararNo,
      aciklama,
      isActive,
    } = req.body;

    if (!uyeNo || uyeNo.trim() === "") {
      logger.warn("Üye numarası boş olamaz");
      return res.status(400).json({ msg: "Üye numarası boş olamaz" });
    }

    try {
      const kisi = await Kisi.findById(kisi_id);
      if (!kisi) {
        logger.warn("Belirtilen kişi bulunamadı", { kisi_id });
        return res.status(404).json({ msg: "Belirtilen kişi bulunamadı" });
      }

      const existingUye = await Uye.findOne({ uyeNo });
      if (existingUye) {
        logger.warn("Bu üye numarası zaten kullanılıyor", { uyeNo });
        return res
          .status(400)
          .json({ msg: "Bu üye numarası zaten kullanılıyor" });
      }

      const yeniUye = new Uye({
        kisi_id,
        uyeRol_id,
        uyeNo,
        sube_id,
        durumu: durumu || "Aktif",
        baslangicTarihi: baslangicTarihi || Date.now(),
        bitisTarihi,
        kayitKararNo,
        aciklama,
        isActive: isActive !== undefined ? isActive : true,
      });

      await yeniUye.save();

      const populatedUye = await Uye.findById(yeniUye._id)
        .populate("kisi_id", ["ad", "soyad", "telefonNumarasi"])
        .populate("sube_id", ["ad"])
        .populate("uyeRol_id", ["ad"]);

      logger.info("Yeni üye eklendi", { uye: populatedUye });
      res.json(populatedUye);
    } catch (err) {
      logger.error("Üye eklenirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   PUT api/uyeler/:id
// @desc    Üye bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("uyeler_guncelleme"),
  async (req, res) => {
    const {
      kisi_id,
      uyeRol_id,
      uyeNo,
      sube_id,
      durumu,
      baslangicTarihi,
      bitisTarihi,
      kayitKararNo,
      aciklama,
      isActive,
    } = req.body;

    const uyeGuncelleme = {};
    if (kisi_id) uyeGuncelleme.kisi_id = kisi_id;
    if (uyeRol_id) uyeGuncelleme.uyeRol_id = uyeRol_id;
    if (uyeNo) uyeGuncelleme.uyeNo = uyeNo;
    if (sube_id) uyeGuncelleme.sube_id = sube_id;
    if (durumu) uyeGuncelleme.durumu = durumu;
    if (baslangicTarihi) uyeGuncelleme.baslangicTarihi = baslangicTarihi;
    if (bitisTarihi !== undefined) uyeGuncelleme.bitisTarihi = bitisTarihi;
    if (kayitKararNo !== undefined) uyeGuncelleme.kayitKararNo = kayitKararNo;
    if (aciklama !== undefined) uyeGuncelleme.aciklama = aciklama;
    if (isActive !== undefined) uyeGuncelleme.isActive = isActive;

    try {
      let uye = await Uye.findById(req.params.id);

      if (!uye) {
        logger.warn("Üye bulunamadı", { id: req.params.id });
        return res.status(404).json({ msg: "Üye bulunamadı" });
      }

      if (uyeNo && uyeNo !== uye.uyeNo) {
        const existingUye = await Uye.findOne({ uyeNo });
        if (existingUye) {
          logger.warn("Bu üye numarası zaten kullanılıyor", { uyeNo });
          return res
            .status(400)
            .json({ msg: "Bu üye numarası zaten kullanılıyor" });
        }
      }

      if (kisi_id) {
        const kisi = await Kisi.findById(kisi_id);
        if (!kisi) {
          logger.warn("Belirtilen kişi bulunamadı", { kisi_id });
          return res.status(404).json({ msg: "Belirtilen kişi bulunamadı" });
        }
      }

      uye = await Uye.findByIdAndUpdate(
        req.params.id,
        { $set: uyeGuncelleme },
        { new: true }
      )
        .populate("kisi_id", ["ad", "soyad", "telefonNumarasi"])
        .populate("sube_id", ["ad"])
        .populate("uyeRol_id", ["ad"]);

      logger.info("Üye bilgileri güncellendi", { id: req.params.id, uye });
      res.json(uye);
    } catch (err) {
      logger.error("Üye bilgileri güncellenirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Üye bulunamadı" });
      }
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   DELETE api/uyeler/:id
// @desc    Üye sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("uyeler_silme"), async (req, res) => {
  try {
    const uye = await Uye.findById(req.params.id);

    if (!uye) {
      logger.warn("Üye bulunamadı", { id: req.params.id });
      return res.status(404).json({ msg: "Üye bulunamadı" });
    }

    await uye.remove();

    logger.info("Üye silindi", { id: req.params.id });
    res.json({ msg: "Üye silindi" });
  } catch (err) {
    logger.error("Üye silinirken hata", { error: err.message });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Üye bulunamadı" });
    }
    res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
  }
});

// @route   POST api/uyeler/delete-many
// @desc    Çoklu üye silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("uyeler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        logger.warn("Silinecek ID listesi geçerli değil", { ids });
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      const result = await Uye.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        logger.warn("Silinecek üye kaydı bulunamadı", { ids });
        return res.status(404).json({ msg: "Silinecek üye kaydı bulunamadı" });
      }

      logger.info("Çoklu üye silindi", { count: result.deletedCount });
      res.json({
        msg: `${result.deletedCount} adet üye silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Çoklu üye silinirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

module.exports = router;
