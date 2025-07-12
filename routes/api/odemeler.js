const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const logger = require("../../utils/logger");

const Odeme = require("../../models/Odeme");
const Borc = require("../../models/Borc");
const Kisi = require("../../models/Kisi");
const Kasa = require("../../models/Kasa");

// Dekont dosyaları için yükleme dizini oluşturma
const dekontsDir = path.join(__dirname, "../../uploads/dekonts");
if (!fs.existsSync(dekontsDir)) {
  fs.mkdirSync(dekontsDir, { recursive: true });
}

// Dekont yükleme için multer ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dekontsDir);
  },
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(20).toString("hex");
    cb(null, `${randomName}${path.extname(file.originalname)}`);
  },
});

// Dosya tipi filtreleme
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Geçersiz dosya tipi. Sadece JPG, PNG ve PDF dosyaları yükleyebilirsiniz."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @route   GET api/odemeler
// @desc    Tüm ödemeleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("odemeler_goruntuleme"),
  async (req, res) => {
    try {
      const odemeler = await Odeme.find()
        .populate("kisi_id", ["ad", "soyad"])
        .populate({
          path: "borc_id",
          select: ["borcTutari", "borclandirmaTarihi", "yil", "ay", "kalan"],
          populate: {
            path: "ucret_id",
            select: ["ad", "tutar"],
            populate: {
              path: "tarife_id",
              select: ["ad", "kod"],
            },
          },
        })
        .populate("kasa_id", ["kasaAdi"])
        .sort({ odemeTarihi: -1 });
      res.json(odemeler);
    } catch (err) {
      logger.error("Ödemeler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/odemeler/:id
// @desc    ID'ye göre ödeme getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("odemeler_goruntuleme"),
  async (req, res) => {
    try {
      const odeme = await Odeme.findById(req.params.id)
        .populate("kisi_id", ["ad", "soyad"])
        .populate({
          path: "borc_id",
          select: [
            "borcTutari",
            "borclandirmaTarihi",
            "kalan",
            "odendi",
            "yil",
            "ay",
          ],
          populate: {
            path: "ucret_id",
            select: ["ad", "tutar"],
            populate: {
              path: "tarife_id",
              select: ["ad", "kod"],
            },
          },
        })
        .populate("kasa_id", ["kasaAdi"]);

      if (!odeme) {
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }

      res.json(odeme);
    } catch (err) {
      logger.error("Ödeme getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/odemeler
// @desc    Yeni ödeme ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("odemeler_ekleme"),
    upload.single("dekont"),
    [
      check("borc_id", "Borç ID gereklidir").not().isEmpty(),
      check("kisi_id", "Kişi ID gereklidir").not().isEmpty(),
      check("kasa_id", "Kasa ID gereklidir").not().isEmpty(),
      check("odemeTutari", "Ödeme tutarı gereklidir").isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Eğer dekont yüklendiyse ama diğer alan validasyonları hata verirse, dosyayı sil
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        errors: errors.array(),
        msg: errors
          .array()
          .map((e) => e.msg)
          .join(", "),
        requestData: {
          borc_id: req.body.borc_id,
          kisi_id: req.body.kisi_id,
          kasa_id: req.body.kasa_id,
        },
      });
    }

    const {
      borc_id,
      kisi_id,
      kasa_id,
      odemeTarihi,
      odemeTutari,
      odemeYontemi,
      aciklama,
      makbuzNo,
    } = req.body;

    try {
      // Borç var mı kontrolü
      const borc = await Borc.findById(borc_id);
      if (!borc) {
        // Dekont varsa sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ msg: "Borç bulunamadı" });
      }

      // Kişi ID kontrolü - eğer gelmiyorsa borçtan alma denemesi
      const kullanilacakKisiId = kisi_id || borc.kisi_id;

      if (!kullanilacakKisiId) {
        // Dekont varsa sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ msg: "Geçerli bir Kişi ID bulunamadı" });
      }

      // Kişi var mı kontrolü
      const kisi = await Kisi.findById(kullanilacakKisiId);
      if (!kisi) {
        // Dekont varsa sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res
          .status(404)
          .json({ msg: "Kişi bulunamadı", kisi_id: kullanilacakKisiId });
      }

      // Kasa var mı kontrolü
      const kasa = await Kasa.findById(kasa_id);
      if (!kasa) {
        // Dekont varsa sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ msg: "Kasa bulunamadı" });
      }

      // Ödeme tutarını iki ondalık basamağa yuvarlama (güvenlik kontrolü)
      const yuvarlanmisOdemeTutari = Math.round(odemeTutari * 100) / 100;

      // Yeni ödeme oluştur (kişi ID kontrolü ile)
      const yeniOdeme = new Odeme({
        borc_id,
        kisi_id: kullanilacakKisiId,
        kasa_id,
        odemeTarihi: odemeTarihi || Date.now(),
        odemeTutari: yuvarlanmisOdemeTutari,
        odemeYontemi: odemeYontemi || "Nakit",
        aciklama,
        makbuzNo,
      });

      // Eğer dosya yüklendiyse ilgili alanları ekle
      if (req.file) {
        yeniOdeme.dekontDosyaAdi = req.file.filename;
        yeniOdeme.dekontOrijinalAd = req.file.originalname;
        yeniOdeme.dekontMimeType = req.file.mimetype;
        yeniOdeme.dekontBoyut = req.file.size;
      }

      await yeniOdeme.save();

      // Borcu güncelle
      // Tüm ödemeleri topla
      const odemeler = await Odeme.find({ borc_id });
      const toplamOdeme = odemeler.reduce(
        (total, item) => total + item.odemeTutari,
        0
      );

      // Kalan tutarı güncelle - hassas hesaplama için tam değerleri kullan
      const kalan = borc.borcTutari - toplamOdeme;
      const odendi = kalan <= 0.009; // 1 kuruştan küçük farkları ödenmiş olarak kabul et

      await Borc.findByIdAndUpdate(borc_id, {
        $set: {
          kalan: kalan > 0 ? kalan : 0,
          odendi,
        },
      });

      res.json(yeniOdeme);
    } catch (err) {
      // Hata oluşursa, eğer dekont yüklendiyse dosyayı sil
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      logger.error("Ödeme eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası: " + err.message);
    }
  }
);

// @route   PUT api/odemeler/:id
// @desc    Ödeme bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  [auth, yetkiKontrol("odemeler_guncelleme"), upload.single("dekont")],
  async (req, res) => {
    const {
      borc_id,
      kisi_id,
      kasa_id,
      odemeTarihi,
      odemeTutari,
      odemeYontemi,
      aciklama,
      makbuzNo,
      dekontSil,
    } = req.body;

    // Ödeme güncelleme objesi
    const odemeGuncelleme = {};
    if (borc_id) odemeGuncelleme.borc_id = borc_id;
    if (kisi_id) odemeGuncelleme.kisi_id = kisi_id;
    if (kasa_id) odemeGuncelleme.kasa_id = kasa_id;
    if (odemeTarihi) odemeGuncelleme.odemeTarihi = odemeTarihi;
    if (odemeTutari !== undefined) {
      // Ödeme tutarını iki ondalık basamağa yuvarla
      odemeGuncelleme.odemeTutari = Math.round(odemeTutari * 100) / 100;
    }
    if (odemeYontemi) odemeGuncelleme.odemeYontemi = odemeYontemi;
    if (aciklama !== undefined) odemeGuncelleme.aciklama = aciklama;
    if (makbuzNo !== undefined) odemeGuncelleme.makbuzNo = makbuzNo;

    try {
      // Ödeme var mı kontrolü
      let odeme = await Odeme.findById(req.params.id);

      if (!odeme) {
        // Dekont varsa sil
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }

      // Dekont silme isteği geldi mi kontrol et
      if (dekontSil === "true" && odeme.dekontDosyaAdi) {
        // Eski dekont dosyasını sil
        const eski_dekont_path = path.join(dekontsDir, odeme.dekontDosyaAdi);
        if (fs.existsSync(eski_dekont_path)) {
          fs.unlinkSync(eski_dekont_path);
        }
        // Dekont bilgilerini temizle
        odemeGuncelleme.dekontDosyaAdi = null;
        odemeGuncelleme.dekontOrijinalAd = null;
        odemeGuncelleme.dekontMimeType = null;
        odemeGuncelleme.dekontBoyut = null;
      }

      // Yeni dekont yüklendi mi
      if (req.file) {
        // Eski dekont varsa sil
        if (odeme.dekontDosyaAdi) {
          const eski_dekont_path = path.join(dekontsDir, odeme.dekontDosyaAdi);
          if (fs.existsSync(eski_dekont_path)) {
            fs.unlinkSync(eski_dekont_path);
          }
        }
        // Yeni dekont bilgilerini ekle
        odemeGuncelleme.dekontDosyaAdi = req.file.filename;
        odemeGuncelleme.dekontOrijinalAd = req.file.originalname;
        odemeGuncelleme.dekontMimeType = req.file.mimetype;
        odemeGuncelleme.dekontBoyut = req.file.size;
      }

      // Eğer ödeme tutarı değişiyorsa, borç durumunu güncelle
      if (odemeTutari !== undefined && odemeTutari !== odeme.odemeTutari) {
        const eskiTutar = odeme.odemeTutari;
        const borc = await Borc.findById(odeme.borc_id);

        if (!borc) {
          return res.status(404).json({ msg: "Bağlantılı borç bulunamadı" });
        }

        // Borç kalanını güncelle - eski ödeme tutarını geri ekle, yeni ödeme tutarını çıkar
        let yeniKalan = borc.kalan + eskiTutar - odemeTutari;

        // Kalan tutar negatif olmamalı
        if (yeniKalan < 0) yeniKalan = 0;

        const odendi = yeniKalan <= 0;

        // Borç bilgilerini güncelle
        await Borc.findByIdAndUpdate(odeme.borc_id, {
          $set: {
            kalan: yeniKalan,
            odendi,
          },
        });
      }

      // Kasa değişiyorsa, kasa var mı kontrolü
      if (kasa_id && kasa_id !== odeme.kasa_id.toString()) {
        const kasa = await Kasa.findById(kasa_id);
        if (!kasa) {
          return res.status(404).json({ msg: "Belirtilen kasa bulunamadı" });
        }
      }

      // Ödemeyi güncelle
      odeme = await Odeme.findByIdAndUpdate(
        req.params.id,
        { $set: odemeGuncelleme },
        { new: true }
      ).populate("kasa_id", ["kasaAdi"]);

      res.json(odeme);
    } catch (err) {
      // Hata oluşursa ve yeni dekont yüklendiyse sil
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      logger.error("Ödeme güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/odemeler/dekont/:id
// @desc    Ödeme dekontunu indir
// @access  Özel
router.get(
  "/dekont/:id",
  auth,
  yetkiKontrol("odemeler_goruntuleme"),
  async (req, res) => {
    try {
      const odeme = await Odeme.findById(req.params.id);

      if (!odeme) {
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }

      if (!odeme.dekontDosyaAdi) {
        return res
          .status(404)
          .json({ msg: "Bu ödemeye ait dekont bulunamadı" });
      }

      const dosyaYolu = path.join(dekontsDir, odeme.dekontDosyaAdi);

      if (!fs.existsSync(dosyaYolu)) {
        return res.status(404).json({ msg: "Dekont dosyası bulunamadı" });
      }

      // İndirme işlemi için başlıkları ayarla
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(odeme.dekontOrijinalAd)}`
      );
      res.setHeader("Content-Type", odeme.dekontMimeType);

      // Dosyayı gönder
      const filestream = fs.createReadStream(dosyaYolu);
      filestream.pipe(res);
    } catch (err) {
      logger.error("Dekont indirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/odemeler/:id
// @desc    Ödeme sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("odemeler_silme"),
  async (req, res) => {
    try {
      // Ödeme var mı kontrolü
      const odeme = await Odeme.findById(req.params.id);

      if (!odeme) {
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }

      // Dekont dosyası varsa sil
      if (odeme.dekontDosyaAdi) {
        const dekontYolu = path.join(dekontsDir, odeme.dekontDosyaAdi);
        if (fs.existsSync(dekontYolu)) {
          fs.unlinkSync(dekontYolu);
        }
      }

      // İlgili borcu güncelleme
      const borc = await Borc.findById(odeme.borc_id);
      if (borc) {
        // Yeni kalan tutarı hesapla
        const yeniKalan = borc.kalan + odeme.odemeTutari;
        const odendi = yeniKalan <= 0;

        await Borc.findByIdAndUpdate(odeme.borc_id, {
          $set: {
            kalan: yeniKalan,
            odendi,
          },
        });
      }

      // Ödemeyi sil
      await odeme.remove();
      res.json({ msg: "Ödeme silindi" });
    } catch (err) {
      logger.error("Ödeme silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Ödeme bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/odemeler/borc/:borc_id
// @desc    Borca göre ödemeleri getir
// @access  Özel
router.get(
  "/borc/:borc_id",
  auth,
  yetkiKontrol("odemeler_goruntuleme"),
  async (req, res) => {
    try {
      const odemeler = await Odeme.find({ borc_id: req.params.borc_id }).sort({
        odemeTarihi: -1,
      });

      res.json(odemeler);
    } catch (err) {
      logger.error("Borca göre ödemeler getirilirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Borç bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/odemeler/kisi/:kisi_id
// @desc    Kişiye göre ödemeleri getir
// @access  Özel
router.get(
  "/kisi/:kisi_id",
  auth,
  yetkiKontrol("odemeler_goruntuleme"),
  async (req, res) => {
    try {
      const odemeler = await Odeme.find({ kisi_id: req.params.kisi_id })
        .populate({
          path: "borc_id",
          select: ["borcTutari", "borclandirmaTarihi", "yil", "ay"],
          populate: {
            path: "ucret_id",
            select: ["ad", "tutar"],
            populate: {
              path: "tarife_id",
              select: ["ad", "kod"],
            },
          },
        })
        .sort({ odemeTarihi: -1 });

      res.json(odemeler);
    } catch (err) {
      logger.error("Kişiye göre ödemeler getirilirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/odemeler/bulk
// @desc    Toplu ödeme ekle
// @access  Özel
router.post(
  "/bulk",
  auth,
  yetkiKontrol("odemeler_ekleme"),
  async (req, res) => {
    try {
      const { odemeler } = req.body;

      if (!Array.isArray(odemeler) || odemeler.length === 0) {
        return res
          .status(400)
          .json({ msg: "Geçerli ödeme verisi gönderilmedi" });
      }

      // Tüm ödemeleri geçirli mi kontrol et ve ekle
      const gecerliOdemeler = [];
      const hataliOdemeler = [];

      for (const odeme of odemeler) {
        const {
          borc_id,
          kisi_id,
          kasa_id,
          odemeTarihi,
          odemeTutari,
          odemeYontemi,
          aciklama,
          makbuzNo,
        } = odeme;

        try {
          // Borç var mı kontrolü
          const borc = await Borc.findById(borc_id);
          if (!borc) {
            hataliOdemeler.push({
              ...odeme,
              hata: "Borç bulunamadı",
            });
            continue;
          }

          // Kasa var mı kontrolü
          const kasa = await Kasa.findById(kasa_id);
          if (!kasa) {
            hataliOdemeler.push({
              ...odeme,
              hata: "Kasa bulunamadı",
            });
            continue;
          }

          // Ödeme tutarını iki ondalık basamağa yuvarlama (güvenlik kontrolü)
          const yuvarlanmisOdemeTutari = Math.round(odemeTutari * 100) / 100;

          // Yeni ödeme oluştur
          const yeniOdeme = new Odeme({
            borc_id,
            kisi_id: kisi_id || borc.kisi_id,
            kasa_id,
            odemeTarihi: odemeTarihi || Date.now(),
            odemeTutari: yuvarlanmisOdemeTutari,
            odemeYontemi: odemeYontemi || "Nakit",
            aciklama,
            makbuzNo,
          });

          await yeniOdeme.save();

          // Borcu güncelle
          // Tüm ödemeleri topla
          const odemeler = await Odeme.find({ borc_id });
          const toplamOdeme = odemeler.reduce(
            (total, item) => total + item.odemeTutari,
            0
          );

          // Kalan tutarı güncelle - hassas hesaplama için tam değerleri kullan
          const kalan = borc.borcTutari - toplamOdeme;
          const odendi = kalan <= 0.009; // 1 kuruştan küçük farkları ödenmiş olarak kabul et

          await Borc.findByIdAndUpdate(borc_id, {
            $set: {
              kalan: kalan > 0 ? kalan : 0,
              odendi,
            },
          });

          // Buraya kadar gelebildiyse, geçerli ödemeler listesine ekle
          gecerliOdemeler.push(yeniOdeme);
        } catch (err) {
          hataliOdemeler.push({
            ...odeme,
            hata: err.message,
          });
        }
      }

      // Populate işlemi
      await Odeme.populate(gecerliOdemeler, [
        { path: "kisi_id", select: "ad soyad" },
        { path: "borc_id", select: "borcTutari yil ay kalan odendi" },
        { path: "kasa_id", select: "kasaAdi" },
      ]);

      // Sonuçları döndür
      res.json({
        eklenenOdemeler: gecerliOdemeler,
        eklenenOdemeSayisi: gecerliOdemeler.length,
        hataliOdemeSayisi: hataliOdemeler.length,
        hataliOdemeler,
      });
    } catch (err) {
      logger.error("Toplu ödeme eklenirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası: " + err.message });
    }
  }
);

module.exports = router;
