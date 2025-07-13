const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Gelir = require("../../models/Gelir");
// const GelirDetay = require("../../models/GelirDetay");
const Kasa = require("../../models/Kasa");
const Ucret = require("../../models/Ucret");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

// @route   GET api/gelirler
// @desc    Tüm gelirleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("gelirler_goruntuleme"),
  async (req, res) => {
    try {
      const gelirler = await Gelir.findAll({
        include: [
          {
            model: Kasa,
            attributes: ["kasaAdi"],
          },
        ],
        order: [["tarih", "DESC"]],
      });
      res.json(gelirler);
    } catch (err) {
      logger.error("Gelirler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/gelirler/:id
// @desc    ID'ye göre gelir getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("gelirler_goruntuleme"),
  async (req, res) => {
    try {
      const gelir = await Gelir.findById(req.params.id).populate("kasa_id", [
        "kasaAdi",
      ]);

      if (!gelir) {
        return res.status(404).json({ msg: "Gelir kaydı bulunamadı" });
      }

      res.json(gelir);
    } catch (err) {
      logger.error("Gelir getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gelir kaydı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/gelirler/detay/:gelir_id
// @desc    Gelire ait detayları getir
// @access  Özel
router.get(
  "/detay/:gelir_id",
  auth,
  yetkiKontrol("gelirler_goruntuleme"),
  async (req, res) => {
    try {
      const gelirDetaylari = await GelirDetay.find({
        gelir_id: req.params.gelir_id,
      })
        .populate({
          path: "ucret_id",
          select: "ad tutar birimUcret",
          populate: {
            path: "tarife_id",
            select: "ad kod",
          },
        })
        .sort({ kayitTarihi: -1 });

      res.json(gelirDetaylari);
    } catch (err) {
      logger.error("Gelir detayları getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/gelirler
// @desc    Yeni gelir kaydı ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("gelirler_ekleme"),
    [
      check("gelirTuru", "Gelir türü gereklidir").not().isEmpty(),
      check("kasa_id", "Kasa ID gereklidir").not().isEmpty(),
      check("tarih", "Tarih gereklidir").not().isEmpty(),
      check("tahsilatTuru", "Tahsilat türü gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      gelirTuru,
      aciklama,
      kasa_id,
      tarih,
      makbuzNo,
      gelirYeri,
      tahsilatTuru,
    } = req.body;

    try {
      // Kasa var mı kontrolü
      const kasa = await Kasa.findById(kasa_id);
      if (!kasa) {
        return res.status(404).json({ msg: "Belirtilen kasa bulunamadı" });
      }

      // Yeni gelir kaydı oluştur
      const yeniGelir = new Gelir({
        gelirTuru,
        aciklama,
        kasa_id,
        tarih,
        makbuzNo,
        gelirYeri,
        tahsilatTuru,
        toplamTutar: 0, // Başlangıçta 0, detaylar eklendikçe güncellenecek
      });

      await yeniGelir.save();

      // Kasa ile ilişkilendir
      const populatedGelir = await Gelir.findById(yeniGelir._id).populate(
        "kasa_id",
        ["kasaAdi"]
      );

      res.json(populatedGelir);
    } catch (err) {
      logger.error("Gelir eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/gelirler/detay
// @desc    Gelir detay kaydı ekle
// @access  Özel
router.post(
  "/detay",
  [
    auth,
    yetkiKontrol("gelirler_ekleme"),
    [
      check("gelir_id", "Gelir ID gereklidir").not().isEmpty(),
      check("ucret_id", "Ücret ID gereklidir").not().isEmpty(),
      check("miktar", "Miktar gereklidir").isNumeric(),
      check("birimFiyat", "Birim fiyat gereklidir").isNumeric(),
      check("toplamTutar", "Toplam tutar gereklidir").isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gelir_id, ucret_id, miktar, birimFiyat, toplamTutar } = req.body;

    try {
      // Gelir var mı kontrolü
      const gelir = await Gelir.findById(gelir_id);
      if (!gelir) {
        return res
          .status(404)
          .json({ msg: "Belirtilen gelir kaydı bulunamadı" });
      }

      // Ücret var mı kontrolü
      const ucret = await Ucret.findById(ucret_id);
      if (!ucret) {
        return res.status(404).json({ msg: "Belirtilen ücret bulunamadı" });
      }

      // Yeni gelir detay kaydı oluştur
      const yeniGelirDetay = new GelirDetay({
        gelir_id,
        ucret_id,
        miktar,
        birimFiyat,
        toplamTutar,
      });

      await yeniGelirDetay.save();

      // Gelir kaydındaki toplam tutarı güncelle
      gelir.toplamTutar += parseFloat(toplamTutar);
      await gelir.save();

      // Detay kaydını ilişkilendir
      const populatedGelirDetay = await GelirDetay.findById(
        yeniGelirDetay._id
      ).populate("ucret_id", ["ad", "tutar", "birimUcret"]);

      res.json({
        gelirDetay: populatedGelirDetay,
        yeniToplamTutar: gelir.toplamTutar,
      });
    } catch (err) {
      logger.error("Gelir detay eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/gelirler/:id
// @desc    Gelir kaydını güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("gelirler_guncelleme"),
  async (req, res) => {
    const {
      gelirTuru,
      aciklama,
      kasa_id,
      tarih,
      makbuzNo,
      gelirYeri,
      tahsilatTuru,
      isActive,
    } = req.body;

    // Gelir güncelleme objesi
    const gelirGuncelleme = {};
    if (gelirTuru) gelirGuncelleme.gelirTuru = gelirTuru;
    if (aciklama !== undefined) gelirGuncelleme.aciklama = aciklama;
    if (kasa_id) gelirGuncelleme.kasa_id = kasa_id;
    if (tarih) gelirGuncelleme.tarih = tarih;
    if (makbuzNo !== undefined) gelirGuncelleme.makbuzNo = makbuzNo;
    if (gelirYeri) gelirGuncelleme.gelirYeri = gelirYeri;
    if (tahsilatTuru) gelirGuncelleme.tahsilatTuru = tahsilatTuru;
    if (isActive !== undefined) gelirGuncelleme.isActive = isActive;

    try {
      // Gelir kaydı var mı kontrolü
      let gelir = await Gelir.findById(req.params.id);

      if (!gelir) {
        return res.status(404).json({ msg: "Gelir kaydı bulunamadı" });
      }

      // Kasa değişiyorsa, kasa var mı kontrolü
      if (kasa_id && kasa_id !== gelir.kasa_id.toString()) {
        const kasa = await Kasa.findById(kasa_id);
        if (!kasa) {
          return res.status(404).json({ msg: "Belirtilen kasa bulunamadı" });
        }
      }

      // Güncelleme yap
      gelir = await Gelir.findByIdAndUpdate(
        req.params.id,
        { $set: gelirGuncelleme },
        { new: true }
      ).populate("kasa_id", ["kasaAdi"]);

      res.json(gelir);
    } catch (err) {
      logger.error("Gelir güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gelir kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/gelirler/:id
// @desc    Gelir kaydını sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("gelirler_silme"),
  async (req, res) => {
    try {
      // Gelir kaydı var mı kontrolü
      const gelir = await Gelir.findById(req.params.id);

      if (!gelir) {
        return res.status(404).json({ msg: "Gelir kaydı bulunamadı" });
      }

      // Önce ilişkili detay kayıtlarını sil
      await GelirDetay.deleteMany({ gelir_id: req.params.id });

      // Ardından gelir kaydını sil
      await gelir.remove();

      res.json({ msg: "Gelir kaydı ve detayları silindi" });
    } catch (err) {
      logger.error("Gelir silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gelir kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/gelirler/detay/:id
// @desc    Gelir detay kaydı sil
// @access  Özel
router.delete(
  "/detay/:id",
  auth,
  yetkiKontrol("gelirler_silme"),
  async (req, res) => {
    try {
      // Gelir detay kaydı var mı kontrolü
      const gelirDetay = await GelirDetay.findById(req.params.id);

      if (!gelirDetay) {
        return res.status(404).json({ msg: "Gelir detay kaydı bulunamadı" });
      }

      // İlgili gelir kaydını bul
      const gelir = await Gelir.findById(gelirDetay.gelir_id);
      if (!gelir) {
        return res.status(404).json({ msg: "İlişkili gelir kaydı bulunamadı" });
      }

      // Gelir toplam tutarını güncelle
      gelir.toplamTutar -= gelirDetay.toplamTutar;
      if (gelir.toplamTutar < 0) gelir.toplamTutar = 0;
      await gelir.save();

      // Detay kaydını sil
      await gelirDetay.remove();

      res.json({
        msg: "Gelir detay kaydı silindi",
        yeniToplamTutar: gelir.toplamTutar,
      });
    } catch (err) {
      logger.error("Gelir detay silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Gelir detay kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/gelirler/delete-many
// @desc    Çoklu gelir kaydı silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("gelirler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // İlişkili tüm detay kayıtlarını sil
      await GelirDetay.deleteMany({ gelir_id: { $in: ids } });

      // Ardından gelir kayıtlarını sil
      const result = await Gelir.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ msg: "Silinecek gelir kaydı bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet gelir kaydı silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Çoklu gelir silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
