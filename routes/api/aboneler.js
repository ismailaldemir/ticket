const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const validationErrorHandler = require("../../middleware/validationErrorHandler");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");

const Abone = require("../../models/Abone");
const AboneDetay = require("../../models/AboneDetay");
const Kisi = require("../../models/Kisi");
const Ucret = require("../../models/Ucret");
const Sube = require("../../models/Sube");

// @route   GET api/aboneler
// @desc    Tüm aboneleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("aboneler_goruntuleme"),
  async (req, res) => {
    try {
      const aboneler = await Abone.findAll({
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
        ],
        order: [["kayitTarihi", "DESC"]],
      });
      logger.info("Tüm aboneler getirildi", { count: aboneler.length });
      res.json(aboneler);
    } catch (err) {
      logger.error("Aboneler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/aboneler/aktif
// @desc    Aktif aboneleri getir
// @access  Özel
router.get(
  "/aktif",
  auth,
  yetkiKontrol("aboneler_goruntuleme"),
  async (req, res) => {
    try {
      const aboneler = await Abone.findAll({
        where: { isActive: true },
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
        ],
        order: [["kayitTarihi", "DESC"]],
      });
      logger.info("Aktif aboneler getirildi", { count: aboneler.length });
      res.json(aboneler);
    } catch (err) {
      logger.error("Aktif aboneler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/aboneler/:id
// @desc    ID'ye göre abone getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("aboneler_goruntuleme"),
  async (req, res) => {
    try {
      const abone = await Abone.findById(req.params.id)
        .populate("kisi_id", ["ad", "soyad", "telefonNumarasi"])
        .populate("sube_id", ["ad"]);

      if (!abone) {
        logger.warn("Abone bulunamadı", { id: req.params.id });
        return res.status(404).json({ msg: "Abone bulunamadı" });
      }

      logger.info("Abone getirildi", { id: req.params.id });
      res.json(abone);
    } catch (err) {
      logger.error("Abone getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Abone bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/aboneler/kisi/:kisi_id
// @desc    Kişiye göre aboneleri getir
// @access  Özel
router.get(
  "/kisi/:kisi_id",
  auth,
  yetkiKontrol("aboneler_goruntuleme"),
  async (req, res) => {
    try {
      const aboneler = await Abone.find({ kisi_id: req.params.kisi_id })
        .populate("kisi_id", ["ad", "soyad", "telefonNumarasi"])
        .populate("sube_id", ["ad"])
        .sort({ kayitTarihi: -1 });

      logger.info("Kişiye göre aboneler getirildi", {
        kisi_id: req.params.kisi_id,
        count: aboneler.length,
      });
      res.json(aboneler);
    } catch (err) {
      logger.error("Kişiye göre aboneler getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/aboneler
// @desc    Yeni abone ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("aboneler_ekleme"),
    [
      check("kisi_id", "Kişi ID gereklidir").not().isEmpty(),
      check("aboneTuru", "Abone türü gereklidir").not().isEmpty(),
      check("aboneNo", "Abone numarası gereklidir").not().isEmpty(),
      check("sube_id", "Şube ID gereklidir").not().isEmpty(),
    ],
    validationErrorHandler,
  ],
  async (req, res) => {
    const {
      kisi_id,
      aboneTuru,
      aboneNo,
      sube_id,
      durum,
      baslamaTarihi,
      bitisTarihi,
      defterNo,
      aciklama,
      adres,
      telefonNo,
      isActive,
    } = req.body;

    try {
      // Kişi var mı kontrolü
      const kisi = await Kisi.findById(kisi_id);
      if (!kisi) {
        logger.warn("Yeni abone ekleme sırasında kişi bulunamadı", { kisi_id });
        return res.status(404).json({ msg: "Belirtilen kişi bulunamadı" });
      }

      // AboneNo benzersiz mi kontrolü
      const existingAbone = await Abone.findOne({ aboneNo });
      if (existingAbone) {
        logger.warn(
          "Yeni abone ekleme sırasında abone numarası zaten kullanılıyor",
          { aboneNo }
        );
        return res
          .status(400)
          .json({ msg: "Bu abone numarası zaten kullanılıyor" });
      }

      // Yeni abone oluştur
      const yeniAbone = new Abone({
        kisi_id,
        aboneTuru,
        aboneNo,
        sube_id,
        durum: durum || "Aktif",
        baslamaTarihi: baslamaTarihi || Date.now(),
        bitisTarihi,
        defterNo,
        aciklama,
        adres,
        telefonNo,
        isActive: isActive !== undefined ? isActive : true,
      });

      await yeniAbone.save();

      // Oluşan aboneyi ilişkili verilerle birlikte döndür
      const populatedAbone = await Abone.findById(yeniAbone._id)
        .populate("kisi_id", ["ad", "soyad", "telefonNumarasi"])
        .populate("sube_id", ["ad"]);

      logger.info("Yeni abone eklendi", { abone_id: yeniAbone._id });
      res.json(populatedAbone);
    } catch (err) {
      logger.error("Yeni abone eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/aboneler/:id
// @desc    Abone bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  [
    auth,
    yetkiKontrol("aboneler_guncelleme"),
    [
      check("kisi_id", "Kişi ID gereklidir").not().isEmpty(),
      check("aboneTuru", "Abone türü gereklidir").not().isEmpty(),
      check("aboneNo", "Abone numarası gereklidir").not().isEmpty(),
      check("sube_id", "Şube ID gereklidir").not().isEmpty(),
    ],
    validationErrorHandler,
  ],
  async (req, res) => {
    const {
      kisi_id,
      aboneTuru,
      aboneNo,
      sube_id,
      durum,
      baslamaTarihi,
      bitisTarihi,
      defterNo,
      aciklama,
      adres,
      telefonNo,
      isActive,
    } = req.body;

    // Abone güncelleme objesi
    const aboneGuncelleme = {};
    if (kisi_id) aboneGuncelleme.kisi_id = kisi_id;
    if (aboneTuru) aboneGuncelleme.aboneTuru = aboneTuru;
    if (aboneNo) aboneGuncelleme.aboneNo = aboneNo;
    if (sube_id) aboneGuncelleme.sube_id = sube_id;
    if (durum) aboneGuncelleme.durum = durum;
    if (baslamaTarihi) aboneGuncelleme.baslamaTarihi = baslamaTarihi;
    if (bitisTarihi !== undefined) aboneGuncelleme.bitisTarihi = bitisTarihi;
    if (defterNo !== undefined) aboneGuncelleme.defterNo = defterNo;
    if (aciklama !== undefined) aboneGuncelleme.aciklama = aciklama;
    if (adres !== undefined) aboneGuncelleme.adres = adres;
    if (telefonNo !== undefined) aboneGuncelleme.telefonNo = telefonNo;
    if (isActive !== undefined) aboneGuncelleme.isActive = isActive;

    try {
      // Abone var mı kontrolü
      let abone = await Abone.findById(req.params.id);

      if (!abone) {
        logger.warn("Abone güncelleme sırasında abone bulunamadı", {
          id: req.params.id,
        });
        return res.status(404).json({ msg: "Abone bulunamadı" });
      }

      // Abone numarası değiştiriliyorsa, benzersiz mi kontrolü
      if (aboneNo && aboneNo !== abone.aboneNo) {
        const existingAbone = await Abone.findOne({ aboneNo });
        if (existingAbone) {
          logger.warn(
            "Abone güncelleme sırasında abone numarası zaten kullanılıyor",
            { aboneNo }
          );
          return res
            .status(400)
            .json({ msg: "Bu abone numarası zaten kullanılıyor" });
        }
      }

      // Kişi kontrolü
      if (kisi_id) {
        const kisi = await Kisi.findById(kisi_id);
        if (!kisi) {
          logger.warn("Abone güncelleme sırasında kişi bulunamadı", {
            kisi_id,
          });
          return res.status(404).json({ msg: "Belirtilen kişi bulunamadı" });
        }
      }

      // Güncelleme yap
      abone = await Abone.findByIdAndUpdate(
        req.params.id,
        { $set: aboneGuncelleme },
        { new: true }
      )
        .populate("kisi_id", ["ad", "soyad", "telefonNumarasi"])
        .populate("sube_id", ["ad"]);

      logger.info("Abone bilgileri güncellendi", { id: req.params.id });
      res.json(abone);
    } catch (err) {
      logger.error("Abone güncellenirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Abone bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/aboneler/:id
// @desc    Abone sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("aboneler_silme"),
  async (req, res) => {
    try {
      // Abone var mı kontrolü
      const abone = await Abone.findById(req.params.id);

      if (!abone) {
        logger.warn("Abone silme sırasında abone bulunamadı", {
          id: req.params.id,
        });
        return res.status(404).json({ msg: "Abone bulunamadı" });
      }

      // Önce aboneye ait detay kayıtlarını sil
      await AboneDetay.deleteMany({ abone_id: req.params.id });

      // Ardından abone kaydını sil
      await abone.remove();

      logger.info("Abone ve detayları silindi", { id: req.params.id });
      res.json({ msg: "Abone ve detayları silindi" });
    } catch (err) {
      logger.error("Abone silinirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Abone bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/aboneler/delete-many
// @desc    Çoklu abone silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("aboneler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        logger.warn("Çoklu abone silme sırasında geçersiz ID listesi", { ids });
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // İlişkili abone detay kayıtlarını sil
      await AboneDetay.deleteMany({ abone_id: { $in: ids } });

      // Ardından aboneleri sil
      const result = await Abone.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        logger.warn(
          "Çoklu abone silme sırasında silinecek abone kaydı bulunamadı",
          { ids }
        );
        return res
          .status(404)
          .json({ msg: "Silinecek abone kaydı bulunamadı" });
      }

      logger.info("Çoklu abone ve ilişkili detayları silindi", {
        count: result.deletedCount,
      });
      res.json({
        msg: `${result.deletedCount} adet abone ve ilişkili detayları silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Çoklu abone silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
