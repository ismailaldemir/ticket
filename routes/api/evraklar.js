const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../../utils/logger");

const Evrak = require("../../models/Evrak");
const EvrakEk = require("../../models/EvrakEk");
const Cari = require("../../models/Cari");

// Dosya yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/evraklar");

    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Kabul edilecek dosya türleri için filtreleme
const fileFilter = (req, file, cb) => {
  // Kabul edilecek dosya türleri
  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "video/mp4",
    "audio/mpeg",
    "application/zip",
    "application/x-rar-compressed",
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Desteklenmeyen dosya türü. Lütfen geçerli bir dosya yükleyin."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// @route   GET api/evraklar
// @desc    Tüm evrakları getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("evraklar_goruntuleme"),
  async (req, res) => {
    try {
      const evraklar = await Evrak.find()
        .populate("cari_id", "cariAd")
        .sort({ tarih: -1 });

      // Ek sayısı bilgisini ekle
      for (let evrak of evraklar) {
        // Evrakın ek sayısını ekleme
        const ekSayisi = await EvrakEk.countDocuments({ evrak_id: evrak._id });
        evrak._doc.ekSayisi = ekSayisi;

        // İlk ekin türünü de ekle (isteğe bağlı)
        if (ekSayisi > 0) {
          const ilkEk = await EvrakEk.findOne({ evrak_id: evrak._id });
          if (ilkEk) {
            evrak._doc.ekTur = ilkEk.ekTur;
          }
        }
      }

      res.json(evraklar);
    } catch (err) {
      logger.error("Evraklar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/evraklar/:id
// @desc    ID'ye göre evrak getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("evraklar_goruntuleme"),
  async (req, res) => {
    try {
      const evrak = await Evrak.findById(req.params.id).populate("cari_id", [
        "cariAd",
      ]);

      if (!evrak) {
        return res.status(404).json({ msg: "Evrak bulunamadı" });
      }

      res.json(evrak);
    } catch (err) {
      logger.error("Evrak getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Evrak bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/evraklar/ekler/:evrak_id
// @desc    Evrak ID'sine göre ekleri getir
// @access  Özel
router.get(
  "/ekler/:evrak_id",
  auth,
  yetkiKontrol("evraklar_goruntuleme"),
  async (req, res) => {
    try {
      const ekler = await EvrakEk.find({ evrak_id: req.params.evrak_id });
      res.json(ekler);
    } catch (err) {
      logger.error("Evrak ekleri getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/evraklar
// @desc    Yeni evrak ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("evraklar_ekleme"),
    [
      check("evrakTuru", "Evrak türü gereklidir").not().isEmpty(),
      check("evrakNo", "Evrak no gereklidir").not().isEmpty(),
      check("evrakKonusu", "Evrak konusu gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      evrakTuru,
      aciklama,
      cari_id,
      tarih,
      evrakNo,
      evrakKonusu,
      gizlilikTuru,
      ilgiliKisi,
      teslimTarihi,
      teslimAlan,
      isActive,
    } = req.body;

    try {
      // Cari ID kontrolü
      if (cari_id) {
        const cari = await Cari.findById(cari_id);
        if (!cari) {
          return res.status(404).json({ msg: "Belirtilen cari bulunamadı" });
        }
      }

      // Yeni evrak oluştur
      const yeniEvrak = new Evrak({
        evrakTuru,
        aciklama,
        cari_id,
        tarih: tarih || Date.now(),
        evrakNo,
        evrakKonusu,
        gizlilikTuru: gizlilikTuru || "Normal Evrak",
        ilgiliKisi,
        teslimTarihi,
        teslimAlan,
        isActive: isActive !== undefined ? isActive : true,
      });

      await yeniEvrak.save();

      // İlişkili cariler için populate yapalım
      const populatedEvrak = await Evrak.findById(yeniEvrak._id).populate(
        "cari_id",
        ["cariAd"]
      );

      res.json(populatedEvrak);
    } catch (err) {
      logger.error("Evrak eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/evraklar/:id
// @desc    Evrak bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("evraklar_guncelleme"),
  async (req, res) => {
    const {
      evrakTuru,
      aciklama,
      cari_id,
      tarih,
      evrakNo,
      evrakKonusu,
      gizlilikTuru,
      ilgiliKisi,
      teslimTarihi,
      teslimAlan,
      isActive,
    } = req.body;

    // Güncellenecek alanları içeren bir nesne oluştur
    const evrakGuncelleme = {};
    if (evrakTuru) evrakGuncelleme.evrakTuru = evrakTuru;
    if (aciklama !== undefined) evrakGuncelleme.aciklama = aciklama;
    if (cari_id) evrakGuncelleme.cari_id = cari_id;
    if (tarih) evrakGuncelleme.tarih = tarih;
    if (evrakNo) evrakGuncelleme.evrakNo = evrakNo;
    if (evrakKonusu) evrakGuncelleme.evrakKonusu = evrakKonusu;
    if (gizlilikTuru) evrakGuncelleme.gizlilikTuru = gizlilikTuru;
    if (ilgiliKisi !== undefined) evrakGuncelleme.ilgiliKisi = ilgiliKisi;
    if (teslimTarihi !== undefined)
      evrakGuncelleme.teslimTarihi = teslimTarihi === "" ? null : teslimTarihi;
    if (teslimAlan !== undefined) evrakGuncelleme.teslimAlan = teslimAlan;
    if (isActive !== undefined) evrakGuncelleme.isActive = isActive;

    try {
      // Evrak var mı kontrolü
      let evrak = await Evrak.findById(req.params.id);
      if (!evrak) {
        return res.status(404).json({ msg: "Evrak bulunamadı" });
      }

      // Cari ID kontrolü
      if (cari_id) {
        const cari = await Cari.findById(cari_id);
        if (!cari) {
          return res.status(404).json({ msg: "Belirtilen cari bulunamadı" });
        }
      }

      // Güncelleme yap
      evrak = await Evrak.findByIdAndUpdate(
        req.params.id,
        { $set: evrakGuncelleme },
        { new: true }
      );

      res.json(evrak);
    } catch (err) {
      logger.error("Evrak güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Evrak bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/evraklar/:id
// @desc    Evrak sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("evraklar_silme"),
  async (req, res) => {
    try {
      // Evrak var mı kontrolü
      const evrak = await Evrak.findById(req.params.id);
      if (!evrak) {
        return res.status(404).json({ msg: "Evrak bulunamadı" });
      }

      // İlişkili evrak eklerini bul ve sil
      const evrakEkler = await EvrakEk.find({ evrak_id: req.params.id });
      for (const ek of evrakEkler) {
        try {
          if (fs.existsSync(ek.dosyaYolu)) {
            fs.unlinkSync(ek.dosyaYolu);
          }
        } catch (error) {
          logger.error(`Dosya silinirken hata: ${ek.dosyaYolu}`, { error });
        }

        // Veritabanından ek kaydını sil
        await ek.remove();
      }

      // Evrak kaydını sil
      await evrak.remove();

      res.json({ msg: "Evrak ve tüm ekleri silindi" });
    } catch (err) {
      logger.error("Evrak silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Evrak bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/evraklar/ekler/:ek_id
// @desc    Evrak eki sil
// @access  Özel
router.delete(
  "/ekler/:ek_id",
  auth,
  yetkiKontrol("evraklar_silme"),
  async (req, res) => {
    try {
      // Evrak eki var mı kontrolü
      const evrakEk = await EvrakEk.findById(req.params.ek_id);
      if (!evrakEk) {
        return res.status(404).json({ msg: "Evrak eki bulunamadı" });
      }

      // Dosyayı sil
      try {
        if (fs.existsSync(evrakEk.dosyaYolu)) {
          fs.unlinkSync(evrakEk.dosyaYolu);
        }
      } catch (error) {
        logger.error(`Dosya silinirken hata: ${evrakEk.dosyaYolu}`, { error });
      }

      // Veritabanından ek kaydını sil
      await evrakEk.remove();

      res.json({ msg: "Evrak eki silindi" });
    } catch (err) {
      logger.error("Evrak eki silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Evrak eki bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
