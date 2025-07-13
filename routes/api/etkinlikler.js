const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

// Modelleri import et
const Etkinlik = require("../../models/Etkinlik");
const EtkinlikKatilimci = require("../../models/EtkinlikKatilimci");
const EtkinlikEk = require("../../models/EtkinlikEk");
const Kisi = require("../../models/Kisi");

// Dosya yükleme işlemleri için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/etkinlikler");

    // Dizin yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, `etkinlik-${uniqueSuffix}${fileExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    // İzin verilen dosya türleri
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx|zip/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Sadece resim, office belgeleri ve zip dosyaları yüklenebilir!"
        )
      );
    }
  },
});

// @route   GET api/etkinlikler
// @desc    Tüm etkinlikleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("etkinlikler_goruntuleme"),
  async (req, res) => {
    try {
      const etkinlikler = await Etkinlik.findAll({
        include: [
          {
            model: require("../../models/Organizasyon"),
            as: "organizasyon",
            attributes: ["ad"],
          },
          {
            model: require("../../models/Kisi"),
            as: "sorumluKisi",
            attributes: ["ad", "soyad"],
          },
        ],
        order: [["baslamaTarihi", "DESC"]],
      });
      res.json(etkinlikler);
    } catch (err) {
      logger.error("Etkinlikler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/etkinlikler/aktif
// @desc    Aktif etkinlikleri getir
// @access  Özel
router.get(
  "/aktif",
  auth,
  yetkiKontrol("etkinlikler_goruntuleme"),
  async (req, res) => {
    try {
      const etkinlikler = await Etkinlik.find({ isActive: true })
        .populate("organizasyon_id", "ad")
        .populate("sorumlukisi_id", "ad soyad")
        .sort({ baslamaTarihi: -1 });

      res.json(etkinlikler);
    } catch (err) {
      logger.error("Aktif etkinlikler getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/etkinlikler/:id
// @desc    ID'ye göre etkinlik getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("etkinlikler_goruntuleme"),
  async (req, res) => {
    try {
      const etkinlik = await Etkinlik.findById(req.params.id)
        .populate("organizasyon_id", "ad")
        .populate("sorumlukisi_id", "ad soyad");

      if (!etkinlik) {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }

      res.json(etkinlik);
    } catch (err) {
      logger.error("Etkinlik getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/etkinlikler
// @desc    Yeni etkinlik ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("etkinlikler_ekleme"),
    [
      check("etkinlikAdi", "Etkinlik adı gereklidir").not().isEmpty(),
      check("baslamaTarihi", "Başlama tarihi gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      organizasyon_id,
      etkinlikAdi,
      aciklama,
      etiketler,
      sorumlukisi_id,
      baslamaTarihi,
      bitisTarihi,
      baslamaSaati,
      bitisSaati,
      yer,
      lokasyon,
      durumu,
      maksimumKatilimci,
      isActive,
    } = req.body;

    try {
      // Sorumlu kişi ID'si varsa kontrolü
      if (sorumlukisi_id) {
        const kisi = await Kisi.findById(sorumlukisi_id);
        if (!kisi) {
          return res
            .status(404)
            .json({ msg: "Belirtilen sorumlu kişi bulunamadı" });
        }
      }

      // Yeni etkinlik oluştur
      const yeniEtkinlik = new Etkinlik({
        organizasyon_id,
        etkinlikAdi,
        aciklama,
        etiketler: etiketler || [],
        sorumlukisi_id,
        baslamaTarihi,
        bitisTarihi,
        baslamaSaati,
        bitisSaati,
        yer,
        lokasyon,
        durumu: durumu || "Planlandı",
        maksimumKatilimci: maksimumKatilimci || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      const etkinlik = await yeniEtkinlik.save();

      res.json(etkinlik);
    } catch (err) {
      logger.error("Etkinlik eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/etkinlikler/:id
// @desc    Etkinlik güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("etkinlikler_guncelleme"),
  async (req, res) => {
    const {
      organizasyon_id,
      etkinlikAdi,
      aciklama,
      etiketler,
      sorumlukisi_id,
      baslamaTarihi,
      bitisTarihi,
      baslamaSaati,
      bitisSaati,
      yer,
      lokasyon,
      durumu,
      maksimumKatilimci,
      isActive,
    } = req.body;

    // Etkinlik güncelleme objesi
    const etkinlikGuncelleme = {};
    if (organizasyon_id) etkinlikGuncelleme.organizasyon_id = organizasyon_id;
    if (etkinlikAdi) etkinlikGuncelleme.etkinlikAdi = etkinlikAdi;
    if (aciklama !== undefined) etkinlikGuncelleme.aciklama = aciklama;
    if (etiketler) etkinlikGuncelleme.etiketler = etiketler;
    if (sorumlukisi_id !== undefined)
      etkinlikGuncelleme.sorumlukisi_id =
        sorumlukisi_id === "" ? null : sorumlukisi_id;
    if (baslamaTarihi) etkinlikGuncelleme.baslamaTarihi = baslamaTarihi;
    if (bitisTarihi !== undefined) etkinlikGuncelleme.bitisTarihi = bitisTarihi;
    if (baslamaSaati !== undefined)
      etkinlikGuncelleme.baslamaSaati = baslamaSaati;
    if (bitisSaati !== undefined) etkinlikGuncelleme.bitisSaati = bitisSaati;
    if (yer !== undefined) etkinlikGuncelleme.yer = yer;
    if (lokasyon !== undefined) etkinlikGuncelleme.lokasyon = lokasyon;
    if (durumu) etkinlikGuncelleme.durumu = durumu;
    if (maksimumKatilimci !== undefined)
      etkinlikGuncelleme.maksimumKatilimci = maksimumKatilimci;
    if (isActive !== undefined) etkinlikGuncelleme.isActive = isActive;

    try {
      // Etkinlik var mı kontrolü
      let etkinlik = await Etkinlik.findById(req.params.id);

      if (!etkinlik) {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }

      // Sorumlu kişi kontrolü
      if (sorumlukisi_id && sorumlukisi_id !== "") {
        const kisi = await Kisi.findById(sorumlukisi_id);
        if (!kisi) {
          return res
            .status(404)
            .json({ msg: "Belirtilen sorumlu kişi bulunamadı" });
        }
      }

      // Güncelleme yap
      etkinlik = await Etkinlik.findByIdAndUpdate(
        req.params.id,
        { $set: etkinlikGuncelleme },
        { new: true }
      )
        .populate("organizasyon_id", "ad")
        .populate("sorumlukisi_id", "ad soyad");

      res.json(etkinlik);
    } catch (err) {
      logger.error("Etkinlik güncellenirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/etkinlikler/:id
// @desc    Etkinlik sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("etkinlikler_silme"),
  async (req, res) => {
    try {
      // Etkinlik var mı kontrolü
      const etkinlik = await Etkinlik.findById(req.params.id);

      if (!etkinlik) {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }

      // İlişkili katılımcıları sil
      await EtkinlikKatilimci.deleteMany({ etkinlik_id: req.params.id });

      // İlişkili ekleri sil
      const ekler = await EtkinlikEk.find({ etkinlik_id: req.params.id });

      // Fiziksel dosyaları sil
      for (const ek of ekler) {
        try {
          const dosyaYolu = path.join(__dirname, "../../", ek.dosyaYolu);
          fs.unlinkSync(dosyaYolu);
        } catch (err) {
          logger.error(`Dosya silinirken hata: ${err.message}`);
        }
      }

      // Ekleri veritabanından sil
      await EtkinlikEk.deleteMany({ etkinlik_id: req.params.id });

      // Etkinliği sil
      await etkinlik.remove();

      res.json({ msg: "Etkinlik ve ilişkili veriler silindi" });
    } catch (err) {
      logger.error("Etkinlik silinirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/etkinlikler/delete-many
// @desc    Çoklu etkinlik silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("etkinlikler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // İlişkili katılımcıları sil
      await EtkinlikKatilimci.deleteMany({ etkinlik_id: { $in: ids } });

      // İlişkili ekleri sil
      const ekler = await EtkinlikEk.find({ etkinlik_id: { $in: ids } });

      // Fiziksel dosyaları sil
      for (const ek of ekler) {
        try {
          const dosyaYolu = path.join(__dirname, "../../", ek.dosyaYolu);
          fs.unlinkSync(dosyaYolu);
        } catch (err) {
          logger.error(`Dosya silinirken hata: ${err.message}`);
        }
      }

      // Ekleri veritabanından sil
      await EtkinlikEk.deleteMany({ etkinlik_id: { $in: ids } });

      // Etkinlikleri sil
      const result = await Etkinlik.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: "Silinecek etkinlik bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet etkinlik ve ilişkili veriler silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Çoklu etkinlik silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/etkinlikler/:id/katilimcilar
// @desc    Etkinlik katılımcılarını getir
// @access  Özel
router.get(
  "/:id/katilimcilar",
  auth,
  yetkiKontrol("etkinlikler_goruntuleme"),
  async (req, res) => {
    try {
      const katilimcilar = await EtkinlikKatilimci.find({
        etkinlik_id: req.params.id,
      })
        .populate("kisi_id", "ad soyad telefonNumarasi email")
        .sort({ kayitTarihi: -1 });

      res.json(katilimcilar);
    } catch (err) {
      logger.error("Etkinlik katılımcıları getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/etkinlikler/:id/katilimci
// @desc    Etkinliğe katılımcı ekle
// @access  Özel
router.post(
  "/:id/katilimci",
  [
    auth,
    yetkiKontrol("etkinlikler_ekleme"),
    [
      check("kisi_id", "Kişi ID gereklidir").not().isEmpty(),
      check("katilimDurumu", "Geçerli bir katılım durumu gereklidir").isIn([
        "Katılacak",
        "Katılmayacak",
        "Belki",
        "Katıldı",
      ]),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { kisi_id, katilimDurumu, not } = req.body;

    try {
      // Etkinlik var mı kontrolü
      const etkinlik = await Etkinlik.findById(req.params.id);
      if (!etkinlik) {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }

      // Kişi var mı kontrolü
      const kisi = await Kisi.findById(kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Katılımcı zaten eklenmiş mi kontrolü
      let katilimci = await EtkinlikKatilimci.findOne({
        etkinlik_id: req.params.id,
        kisi_id: kisi_id,
      });

      if (katilimci) {
        return res
          .status(400)
          .json({ msg: "Bu kişi zaten etkinliğe eklenmiş" });
      }

      // Maksimum katılımcı kontrolü
      if (etkinlik.maksimumKatilimci > 0) {
        const mevcutKatilimciSayisi = await EtkinlikKatilimci.countDocuments({
          etkinlik_id: req.params.id,
          katilimDurumu: { $in: ["Katılacak", "Katıldı"] },
        });

        if (
          mevcutKatilimciSayisi >= etkinlik.maksimumKatilimci &&
          (katilimDurumu === "Katılacak" || katilimDurumu === "Katıldı")
        ) {
          return res.status(400).json({
            msg: "Maksimum katılımcı sayısına ulaşıldı",
            maksimum: etkinlik.maksimumKatilimci,
            mevcut: mevcutKatilimciSayisi,
          });
        }
      }

      // Yeni katılımcı ekle
      katilimci = new EtkinlikKatilimci({
        etkinlik_id: req.params.id,
        kisi_id,
        katilimDurumu,
        not,
      });

      await katilimci.save();

      // Katılımcı nesnesini doldur
      katilimci = await EtkinlikKatilimci.findById(katilimci._id).populate(
        "kisi_id",
        "ad soyad telefonNumarasi email"
      );

      res.json(katilimci);
    } catch (err) {
      logger.error("Etkinliğe katılımcı eklenirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/etkinlikler/:id/bulk-katilimci
// @desc    Etkinliğe toplu katılımcı ekle
// @access  Özel
router.post(
  "/:id/bulk-katilimci",
  auth,
  yetkiKontrol("etkinlikler_ekleme"),
  async (req, res) => {
    try {
      const { katilimcilar } = req.body;

      // Gelen parametreleri doğrula
      if (!req.params.id) {
        return res.status(400).json({ msg: "Etkinlik ID gereklidir" });
      }

      if (!Array.isArray(katilimcilar) || katilimcilar.length === 0) {
        return res
          .status(400)
          .json({ msg: "Geçerli katılımcı listesi sağlanmadı" });
      }

      // Etkinlik var mı kontrolü
      const etkinlik = await Etkinlik.findById(req.params.id);
      if (!etkinlik) {
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }

      // Mevcut katılımcı sayısı kontrolü
      const mevcutKatilimciSayisi = await EtkinlikKatilimci.countDocuments({
        etkinlik_id: req.params.id,
        katilimDurumu: { $in: ["Katılacak", "Katıldı"] },
      });

      // Başarılı ve başarısız katılımcı listelerini tut
      const eklenenKatilimcilar = [];
      const eklenemeyenKatilimcilar = [];

      for (const katilimciVeri of katilimcilar) {
        try {
          const { kisi_id, katilimDurumu, not } = katilimciVeri;

          // Kişi ID'sini doğrula
          if (!kisi_id) {
            eklenemeyenKatilimcilar.push({
              kisi_id: "Geçersiz",
              sebep: "Kişi ID boş olamaz",
            });
            continue;
          }

          // Kişi var mı kontrolü
          const kisi = await Kisi.findById(kisi_id);
          if (!kisi) {
            eklenemeyenKatilimcilar.push({
              kisi_id,
              sebep: "Kişi bulunamadı",
            });
            continue;
          }

          // Katılımcı zaten eklenmiş mi kontrolü
          const mevcutKatilimci = await EtkinlikKatilimci.findOne({
            etkinlik_id: req.params.id,
            kisi_id,
          });

          if (mevcutKatilimci) {
            eklenemeyenKatilimcilar.push({
              kisi_id,
              sebep: "Bu kişi zaten etkinliğe eklenmiş",
            });
            continue;
          }

          // Maksimum katılımcı kontrolü
          if (etkinlik.maksimumKatilimci > 0) {
            const yeniKatilimciSayisi = eklenenKatilimcilar.filter(
              (k) =>
                k.katilimDurumu === "Katılacak" || k.katilimDurumu === "Katıldı"
            ).length;

            if (
              mevcutKatilimciSayisi + yeniKatilimciSayisi >=
                etkinlik.maksimumKatilimci &&
              (katilimDurumu === "Katılacak" || katilimDurumu === "Katıldı")
            ) {
              eklenemeyenKatilimcilar.push({
                kisi_id,
                sebep: "Maksimum katılımcı sayısına ulaşıldı",
              });
              continue;
            }
          }

          // Yeni katılımcı ekle
          const yeniKatilimci = new EtkinlikKatilimci({
            etkinlik_id: req.params.id,
            kisi_id,
            katilimDurumu: katilimDurumu || "Katılacak",
            not: not || "",
          });

          await yeniKatilimci.save();
          eklenenKatilimcilar.push(yeniKatilimci);
        } catch (err) {
          logger.error("Katılımcı ekleme hatası", { error: err.message });
          eklenemeyenKatilimcilar.push({
            kisi_id: katilimciVeri.kisi_id,
            sebep: "İşlem sırasında hata oluştu: " + err.message,
          });
        }
      }

      // Sonuçları detaylı olarak döndür
      res.json({
        basarili: true,
        eklenenler: eklenenKatilimcilar.length,
        eklenmeyenler: eklenemeyenKatilimcilar.length,
        eklenemeyenDetaylar: eklenemeyenKatilimcilar,
      });
    } catch (err) {
      logger.error("Toplu katılımcı ekleme hatası", { error: err.message });
      res.status(500).send("Sunucu hatası: " + err.message);
    }
  }
);

// @route   PUT api/etkinlikler/katilimci/:id
// @desc    Katılımcı güncelle
// @access  Özel
router.put(
  "/katilimci/:id",
  auth,
  yetkiKontrol("etkinlikler_guncelleme"),
  async (req, res) => {
    const { katilimDurumu, not, isActive } = req.body;

    // Katılımcı güncelleme objesi
    const katilimciGuncelleme = {};
    if (katilimDurumu) katilimciGuncelleme.katilimDurumu = katilimDurumu;
    if (not !== undefined) katilimciGuncelleme.not = not;
    if (isActive !== undefined) katilimciGuncelleme.isActive = isActive;

    try {
      // Katılımcı var mı kontrolü
      let katilimci = await EtkinlikKatilimci.findById(req.params.id);

      if (!katilimci) {
        return res.status(404).json({ msg: "Katılımcı bulunamadı" });
      }

      // Güncelleme yap
      katilimci = await EtkinlikKatilimci.findByIdAndUpdate(
        req.params.id,
        { $set: katilimciGuncelleme },
        { new: true }
      ).populate("kisi_id", "ad soyad telefonNumarasi email");

      res.json(katilimci);
    } catch (err) {
      logger.error("Katılımcı güncellenirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Katılımcı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/etkinlikler/katilimci/:id
// @desc    Katılımcı sil
// @access  Özel
router.delete(
  "/katilimci/:id",
  auth,
  yetkiKontrol("etkinlikler_silme"),
  async (req, res) => {
    try {
      // Katılımcı var mı kontrolü
      const katilimci = await EtkinlikKatilimci.findById(req.params.id);

      if (!katilimci) {
        return res.status(404).json({ msg: "Katılımcı bulunamadı" });
      }

      await katilimci.remove();
      res.json({ msg: "Katılımcı silindi", id: req.params.id });
    } catch (err) {
      logger.error("Katılımcı silinirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Katılımcı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/etkinlikler/:id/ekler
// @desc    Etkinlik eklerini getir
// @access  Özel
router.get(
  "/:id/ekler",
  auth,
  yetkiKontrol("etkinlikler_goruntuleme"),
  async (req, res) => {
    try {
      const ekler = await EtkinlikEk.find({
        etkinlik_id: req.params.id,
      }).sort({ yuklemeTarihi: -1 });

      res.json(ekler);
    } catch (err) {
      logger.error("Etkinlik ekleri getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/etkinlikler/:id/ek
// @desc    Etkinliğe dosya ekle
// @access  Özel
router.post(
  "/:id/ek",
  [auth, yetkiKontrol("etkinlikler_ekleme"), upload.single("dosya")],
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "Lütfen bir dosya seçin" });
      }

      // Etkinlik var mı kontrolü
      const etkinlik = await Etkinlik.findById(req.params.id);

      if (!etkinlik) {
        // Dosya yüklendiyse sil
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }

      // Dosya türünü belirle
      let ekTur = "Diğer";
      if (req.file.mimetype.startsWith("image/")) {
        ekTur = "Resim";
      } else if (
        req.file.mimetype.includes("pdf") ||
        req.file.mimetype.includes("document") ||
        req.file.mimetype.includes("sheet") ||
        req.file.mimetype.includes("presentation")
      ) {
        ekTur = "Belge";
      }

      // Yeni ek oluştur
      const yeniEk = new EtkinlikEk({
        etkinlik_id: req.params.id,
        dosyaAdi: req.file.filename,
        orijinalDosyaAdi: req.file.originalname,
        dosyaYolu: req.file.path
          .replace(/\\/g, "/")
          .replace(/^.*\/uploads/, "uploads"),
        dosyaBoyutu: req.file.size,
        mimeTur: req.file.mimetype,
        ekTur,
        aciklama: req.body.aciklama || "",
      });

      await yeniEk.save();
      res.json(yeniEk);
    } catch (err) {
      logger.error("Etkinliğe dosya eklenirken hata", { error: err.message });

      // Dosya yüklendiyse sil
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          logger.error("Dosya silinirken hata", { error: unlinkErr.message });
        }
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/etkinlikler/:id/ekler
// @desc    Etkinliğe çoklu dosya ekle
// @access  Özel
router.post(
  "/:id/ekler",
  [auth, yetkiKontrol("etkinlikler_ekleme"), upload.array("dosyalar", 10)],
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: "Lütfen en az bir dosya seçin" });
      }

      // Etkinlik var mı kontrolü
      const etkinlik = await Etkinlik.findById(req.params.id);

      if (!etkinlik) {
        // Dosyalar yüklendiyse sil
        if (req.files && req.files.length > 0) {
          req.files.forEach((file) => {
            if (file.path) {
              try {
                fs.unlinkSync(file.path);
              } catch (err) {
                logger.error(`Dosya silinemedi: ${file.path}`, {
                  error: err.message,
                });
              }
            }
          });
        }
        return res.status(404).json({ msg: "Etkinlik bulunamadı" });
      }

      const eklenenDosyalar = [];

      // Her dosya için ek kaydı oluştur
      for (const file of req.files) {
        // Dosya türünü belirle
        let ekTur = "Diğer";
        if (file.mimetype.startsWith("image/")) {
          ekTur = "Resim";
        } else if (
          file.mimetype.includes("pdf") ||
          file.mimetype.includes("document") ||
          file.mimetype.includes("sheet") ||
          file.mimetype.includes("presentation")
        ) {
          ekTur = "Belge";
        }

        // Yeni ek oluştur
        const yeniEk = new EtkinlikEk({
          etkinlik_id: req.params.id,
          dosyaAdi: file.filename,
          orijinalDosyaAdi: file.originalname,
          dosyaYolu: file.path
            .replace(/\\/g, "/")
            .replace(/^.*\/uploads/, "uploads"),
          dosyaBoyutu: file.size,
          mimeTur: file.mimetype,
          ekTur,
          aciklama: req.body.aciklama || "",
        });

        await yeniEk.save();
        eklenenDosyalar.push(yeniEk);
      }

      res.json({
        msg: `${eklenenDosyalar.length} dosya başarıyla yüklendi`,
        eklenenDosyalar,
      });
    } catch (err) {
      logger.error("Etkinliğe çoklu dosya eklenirken hata", {
        error: err.message,
      });

      // Dosyalar yüklendiyse sil
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          if (file.path) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkErr) {
              logger.error(`Dosya silinemedi: ${file.path}`, {
                error: unlinkErr.message,
              });
            }
          }
        });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/etkinlikler/ek/:id
// @desc    Etkinlik ekini sil
// @access  Özel
router.delete(
  "/ek/:id",
  auth,
  yetkiKontrol("etkinlikler_silme"),
  async (req, res) => {
    try {
      // Ek var mı kontrolü
      const ek = await EtkinlikEk.findById(req.params.id);

      if (!ek) {
        return res.status(404).json({ msg: "Dosya bulunamadı" });
      }

      // Fiziksel dosyayı sil
      try {
        const dosyaYolu = path.join(__dirname, "../../", ek.dosyaYolu);
        fs.unlinkSync(dosyaYolu);
      } catch (err) {
        logger.error(`Dosya silinirken hata: ${err.message}`);
        // Fiziksel dosya silinirken hata olsa bile veritabanı kaydını silmeye devam et
      }

      // Veritabanı kaydını sil
      await ek.remove();
      res.json({ msg: "Dosya silindi", id: req.params.id });
    } catch (err) {
      logger.error("Etkinlik eki silinirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Dosya bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
