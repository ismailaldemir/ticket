const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check, validationResult } = require("express-validator");
const validationErrorHandler = require("../../middleware/validationErrorHandler");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const logger = require("../../utils/logger");

const Organizasyon = require("../../models/Organizasyon");
const Sube = require("../../models/Sube");
const Telefon = require("../../models/Telefon");
const Adres = require("../../models/Adres");
const SosyalMedya = require("../../models/SosyalMedya");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join("uploads", "organizasyonlar");

    // Dizin yoksa oluştur
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Güvenli dosya adı oluştur (büyük-küçük harf duyarlılığını kaldır, özel karakterleri temizle)
    const fileName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-\.]+/g, "");

    cb(null, `${Date.now()}-${fileName}`);
  },
});

// Dosya filtresi (sadece resim dosyalarını kabul et)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Yalnızca resim dosyaları yüklenebilir!"), false);
  }
};

// Multer upload nesnesi
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// @route   GET api/organizasyonlar
// @desc    Tüm organizasyonları getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("organizasyonlar_goruntuleme"),
  async (req, res) => {
    try {
      const organizasyonlar = await Organizasyon.findAll({
        include: [
          { model: Sube, as: "subeler", attributes: ["id", "ad", "isActive"] },
          {
            model: Adres,
            as: "adresler",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: Telefon,
            as: "telefonlar",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: SosyalMedya,
            as: "sosyalMedyalar",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
        order: [["ad", "ASC"]],
      });
      res.json(organizasyonlar);
    } catch (err) {
      logger.error("Organizasyonlar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/organizasyonlar/active
// @desc    Aktif organizasyonları getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("organizasyonlar_goruntuleme"),
  async (req, res) => {
    try {
      const organizasyonlar = await Organizasyon.findAll({
        where: { isActive: true },
        order: [["ad", "ASC"]],
      });
      res.json(organizasyonlar);
    } catch (err) {
      logger.error("Aktif organizasyonlar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/organizasyonlar/:id
// @desc    ID'ye göre organizasyon getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("organizasyonlar_goruntuleme"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const organizasyon = await Organizasyon.findOne({
        where: { id },
        include: [
          { model: Sube, as: "subeler", attributes: ["id", "ad", "isActive"] },
          {
            model: Adres,
            as: "adresler",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: Telefon,
            as: "telefonlar",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: SosyalMedya,
            as: "sosyalMedyalar",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
      });

      if (!organizasyon) {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      res.json(organizasyon);
    } catch (err) {
      logger.error("Organizasyon getirilirken hata", { error: err.message });
      res.status(500).json({ error: err.message });
    }
  }
);

// @route   POST api/organizasyonlar
// @desc    Yeni organizasyon ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("organizasyonlar_ekleme"),
    [check("ad", "Organizasyon adı gereklidir").not().isEmpty()],
    validationErrorHandler,
  ],
  async (req, res) => {
    try {
      const {
        ad,
        misyon,
        vizyon,
        hakkinda,
        kurulusTarihi,
        aciklama,
        lokasyon,
        iletisimBilgileri,
        isActive,
      } = req.body;

      // Yeni organizasyon oluştur
      const organizasyon = await Organizasyon.create({
        ad,
        misyon,
        vizyon,
        hakkinda,
        kurulusTarihi,
        aciklama,
        lokasyon,
        iletisimBilgileri,
        isActive,
      });
      res.json(organizasyon);
    } catch (err) {
      logger.error("Organizasyon eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/organizasyonlar/:id
// @desc    Organizasyon bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  [
    auth,
    yetkiKontrol("organizasyonlar_guncelleme"),
    [check("ad", "Organizasyon adı gereklidir").not().isEmpty()],
    validationErrorHandler,
  ],
  async (req, res) => {
    try {
      const {
        ad,
        misyon,
        vizyon,
        hakkinda,
        kurulusTarihi,
        aciklama,
        lokasyon,
        iletisimBilgileri,
        isActive,
      } = req.body;

      // Organizasyon var mı kontrolü
      const organizasyon = await Organizasyon.findByPk(req.params.id);
      if (!organizasyon) {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      // Güncelleme alanları
      await organizasyon.update({
        ...(ad && { ad }),
        ...(misyon !== undefined && { misyon }),
        ...(vizyon !== undefined && { vizyon }),
        ...(hakkinda !== undefined && { hakkinda }),
        ...(kurulusTarihi !== undefined && { kurulusTarihi }),
        ...(aciklama !== undefined && { aciklama }),
        ...(lokasyon && { lokasyon }),
        ...(iletisimBilgileri && { iletisimBilgileri }),
        ...(isActive !== undefined && { isActive })
      });
      res.json(organizasyon);
    } catch (err) {
      logger.error("Organizasyon güncellenirken hata", { error: err.message });
      if (err.name === "SequelizeValidationError" || err.name === "SequelizeDatabaseError") {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/organizasyonlar/:id
// @desc    Organizasyon sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("organizasyonlar_silme"),
  async (req, res) => {
    try {
      // Organizasyon var mı kontrolü
      const organizasyon = await Organizasyon.findByPk(req.params.id);
      if (!organizasyon) {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      // İlgili telefon, adres ve sosyal medya kayıtlarını sil
      await Telefon.destroy({
        where: { referansId: req.params.id, referansTur: "Organizasyon" },
      });
      await Adres.destroy({
        where: { referansId: req.params.id, referansTur: "Organizasyon" },
      });
      await SosyalMedya.destroy({
        where: { referansId: req.params.id, referansTur: "Organizasyon" },
      });

      // Organizasyona ait görselleri sil
      if (organizasyon.gorselBilgileri) {
        const gorselTipleri = ["logo", "amblem", "favicon"];
        gorselTipleri.forEach((tip) => {
          if (
            organizasyon.gorselBilgileri[tip] &&
            organizasyon.gorselBilgileri[tip].dosyaYolu
          ) {
            const dosyaYolu = path.join(
              __dirname,
              "../..",
              organizasyon.gorselBilgileri[tip].dosyaYolu
            );
            if (fs.existsSync(dosyaYolu)) {
              fs.unlinkSync(dosyaYolu);
            }
          }
        });
      }

      // Organizasyonu sil
      await organizasyon.destroy();

      res.json({ msg: "Organizasyon silindi" });
    } catch (err) {
      logger.error("Organizasyon silinirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/organizasyonlar/delete-many
// @desc    Çoklu organizasyon silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("organizasyonlar_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek organizasyon ID'leri gereklidir" });
      }

      // İlgili organizasyonları al ve görselleri sil
      const organizasyonlar = await Organizasyon.findAll({
        where: {
          id: ids
        }
      });

      for (const org of organizasyonlar) {
        // Görselleri sil
        if (org.gorselBilgileri) {
          const gorselTipleri = ["logo", "amblem", "favicon"];

          gorselTipleri.forEach((tip) => {
            if (
              org.gorselBilgileri[tip] &&
              org.gorselBilgileri[tip].dosyaYolu
            ) {
              const dosyaYolu = path.join(
                __dirname,
                "../..",
                org.gorselBilgileri[tip].dosyaYolu
              );
              if (fs.existsSync(dosyaYolu)) {
                fs.unlinkSync(dosyaYolu);
              }
            }
          });
        }
      }

      // İlgili telefon, adres ve sosyal medya kayıtlarını sil
      await Telefon.destroy({
        where: {
          referansId: ids,
          referansTur: "Organizasyon",
        }
      });
      await Adres.destroy({
        where: {
          referansId: ids,
          referansTur: "Organizasyon",
        }
      });
      await SosyalMedya.destroy({
        where: {
          referansId: ids,
          referansTur: "Organizasyon",
        }
      });

      // Organizasyonları sil
      await Organizasyon.deleteMany({ _id: { $in: ids } });

      res.json({ msg: "Seçili organizasyonlar silindi", silinen: ids });
    } catch (err) {
      logger.error("Çoklu organizasyon silinirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// --- GÖRSEL İŞLEMLERİ ---

// @route   POST api/organizasyonlar/:id/gorsel/:type
// @desc    Organizasyon görseli (logo, amblem, favicon) yükle
// @access  Özel
router.post(
  "/:id/gorsel/:type",
  auth,
  yetkiKontrol("organizasyonlar_guncelleme"),
  upload.single("gorsel"),
  async (req, res) => {
    try {
      const gorselTipi = req.params.type;
      if (!["logo", "amblem", "favicon"].includes(gorselTipi)) {
        // Dosya yüklendiyse sil
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ msg: "Geçersiz görsel tipi" });
      }

      const organizasyon = await Organizasyon.findByPk(req.params.id);

      if (!organizasyon) {
        // Dosya yüklendiyse sil
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      // Eski görsel varsa sil
      if (
        organizasyon.gorselBilgileri &&
        organizasyon.gorselBilgileri[gorselTipi] &&
        organizasyon.gorselBilgileri[gorselTipi].dosyaYolu
      ) {
        try {
          const eskiDosyaYolu = path.join(
            __dirname,
            "..",
            "..",
            organizasyon.gorselBilgileri[gorselTipi].dosyaYolu
          );
          if (fs.existsSync(eskiDosyaYolu)) {
            fs.unlinkSync(eskiDosyaYolu);
          }
        } catch (err) {
          logger.error("Eski görsel silinirken hata", { error: err.message });
          // İşleme devam et
        }
      }

      // gorselBilgileri yoksa oluştur
      if (!organizasyon.gorselBilgileri) {
        organizasyon.gorselBilgileri = {};
      }

      // Yeni görsel bilgilerini ayarla
      organizasyon.gorselBilgileri[gorselTipi] = {
        dosyaAdi: req.file.filename,
        dosyaYolu: req.file.path.replace(/\\/g, "/"), // Windows path uyumluluğu
        yuklemeTarihi: Date.now(),
      };

      await organizasyon.save();

      res.json({
        msg: `${gorselTipi} başarıyla yüklendi`,
        gorsel: organizasyon.gorselBilgileri[gorselTipi],
      });
    } catch (err) {
      logger.error("Organizasyon görseli yüklenirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/organizasyonlar/:id/gorsel/:type
// @desc    Organizasyon görselini sil
// @access  Özel
router.delete(
  "/:id/gorsel/:type",
  auth,
  yetkiKontrol("organizasyonlar_guncelleme"),
  async (req, res) => {
    try {
      const gorselTipi = req.params.type;
      if (!["logo", "amblem", "favicon"].includes(gorselTipi)) {
        return res.status(400).json({ msg: "Geçersiz görsel tipi" });
      }

      const organizasyon = await Organizasyon.findByPk(req.params.id);

      if (!organizasyon) {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      // Görsel yoksa hata döndür
      if (
        !organizasyon.gorselBilgileri ||
        !organizasyon.gorselBilgileri[gorselTipi]
      ) {
        return res.status(404).json({ msg: "Belirtilen görsel bulunamadı" });
      }

      // Dosyayı fiziksel olarak sil
      const dosyaYolu = path.join(
        __dirname,
        "..",
        "..",
        organizasyon.gorselBilgileri[gorselTipi].dosyaYolu
      );

      if (fs.existsSync(dosyaYolu)) {
        fs.unlinkSync(dosyaYolu);
      }

      // Veritabanından görsel referansını sil
      organizasyon.gorselBilgileri[gorselTipi] = undefined;

      await organizasyon.save();

      res.json({ msg: `${gorselTipi} başarıyla silindi` });
    } catch (err) {
      logger.error("Organizasyon görseli silinirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// --- TELEFON İŞLEMLERİ ---

// @route   GET api/organizasyonlar/:id/telefonlar
// @desc    Organizasyona ait telefonları getir
// @access  Özel
router.get(
  "/:id/telefonlar",
  auth,
  yetkiKontrol("organizasyonlar_goruntuleme"),
  async (req, res) => {
    try {
      const telefonlar = await Telefon.findAll({
        where: {
          referansId: req.params.id,
          referansTur: "Organizasyon"
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        order: [['durumu', 'ASC'], ['tur', 'ASC']]
      });

      res.json(telefonlar);
    } catch (err) {
      logger.error("Organizasyon telefonları getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/organizasyonlar/:id/telefonlar
// @desc    Organizasyona yeni telefon ekle
// @access  Özel
router.post(
  "/:id/telefonlar",
  [
    auth,
    yetkiKontrol("organizasyonlar_guncelleme"),
    [check("telefonNumarasi", "Telefon numarası gereklidir").not().isEmpty()],
    validationErrorHandler,
  ],
  async (req, res) => {
    try {
      const organizasyon = await Organizasyon.findById(req.params.id);
      if (!organizasyon) {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      const {
        telefonNumarasi,
        tur,
        aciklama,
        baslamaTarihi,
        bitisTarihi,
        durumu,
      } = req.body;

      // Yeni telefon oluştur
      const yeniTelefon = new Telefon({
        telefonNumarasi,
        tur: tur || "İş",
        aciklama,
        referansId: req.params.id,
        referansTur: "Organizasyon",
        baslamaTarihi,
        bitisTarihi,
        durumu: durumu || "Aktif",
      });

      const telefon = await yeniTelefon.save();
      res.json(telefon);
    } catch (err) {
      logger.error("Organizasyon telefon eklenirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// --- ADRES İŞLEMLERİ ---

// @route   GET api/organizasyonlar/:id/adresler
// @desc    Organizasyona ait adresleri getir
// @access  Özel
router.get(
  "/:id/adresler",
  auth,
  yetkiKontrol("organizasyonlar_goruntuleme"),
  async (req, res) => {
    try {
      const adresler = await Adres.findAll({
        where: {
          referansId: req.params.id,
          referansTur: "Organizasyon"
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        order: [['durumu', 'ASC'], ['tur', 'ASC']]
      });

      res.json(adresler);
    } catch (err) {
      logger.error("Organizasyon adresleri getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/organizasyonlar/:id/adresler
// @desc    Organizasyona yeni adres ekle
// @access  Özel
router.post(
  "/:id/adresler",
  [
    auth,
    yetkiKontrol("organizasyonlar_guncelleme"),
    [check("adres", "Adres gereklidir").not().isEmpty()],
    validationErrorHandler,
  ],
  async (req, res) => {
    try {
      const organizasyon = await Organizasyon.findById(req.params.id);
      if (!organizasyon) {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      const {
        adres,
        il,
        ilce,
        postaKodu,
        ulke,
        tur,
        lokasyon,
        aciklama,
        varsayilan,
        baslamaTarihi,
        bitisTarihi,
        durumu,
      } = req.body;

      // Eğer varsayılan olarak işaretlendiyse diğer varsayılan adresleri kaldır
      if (varsayilan) {
        await Adres.update(
          { varsayilan: false },
          {
            where: {
              referansId: req.params.id,
              referansTur: "Organizasyon",
              varsayilan: true
            }
          }
        );
      }

      // Yeni adres oluştur
      const yeniAdres = await Adres.create({
        adres,
        il,
        ilce,
        postaKodu,
        ulke: ulke || "Türkiye",
        tur: tur || "İş",
        lokasyon,
        aciklama,
        referansId: req.params.id,
        referansTur: "Organizasyon",
        varsayilan: varsayilan || false,
        baslamaTarihi,
        bitisTarihi,
        durumu: durumu || "Aktif",
      });

      const adresKaydi = await yeniAdres.save();
      res.json(adresKaydi);
    } catch (err) {
      logger.error("Organizasyon adres eklenirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// --- SOSYAL MEDYA İŞLEMLERİ ---

// @route   GET api/organizasyonlar/:id/sosyal-medya
// @desc    Organizasyona ait sosyal medya hesaplarını getir
// @access  Özel
router.get(
  "/:id/sosyal-medya",
  auth,
  yetkiKontrol("organizasyonlar_goruntuleme"),
  async (req, res) => {
    try {
      const sosyalMedyalar = await SosyalMedya.findAll({
        where: {
          referansId: req.params.id,
          referansTur: "Organizasyon"
        },
        order: [['tur', 'ASC'], ['kayitTarihi', 'DESC']]
      });

      res.json(sosyalMedyalar);
    } catch (err) {
      logger.error("Organizasyon sosyal medya hesapları getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/organizasyonlar/:id/sosyal-medya
// @desc    Organizasyona yeni sosyal medya hesabı ekle
// @access  Özel
router.post(
  "/:id/sosyal-medya",
  [
    auth,
    yetkiKontrol("organizasyonlar_guncelleme"),
    [
      check("kullaniciAdi", "Hesap adı/Kullanıcı adı gereklidir")
        .not()
        .isEmpty(),
      check("tur", "Sosyal medya türü gereklidir").not().isEmpty(),
    ],
    validationErrorHandler,
  ],
  async (req, res) => {
    try {
      const organizasyon = await Organizasyon.findById(req.params.id);
      if (!organizasyon) {
        return res.status(404).json({ msg: "Organizasyon bulunamadı" });
      }

      const {
        kullaniciAdi,
        url,
        tur,
        aciklama,
        baslamaTarihi,
        bitisTarihi,
        durumu,
      } = req.body;

      // Yeni sosyal medya hesabı oluştur
      const yeniSosyalMedya = new SosyalMedya({
        kullaniciAdi,
        url,
        tur,
        aciklama,
        referansId: req.params.id,
        referansTur: "Organizasyon",
        baslamaTarihi,
        bitisTarihi,
        durumu: durumu || "Aktif",
      });

      const sosyalMedya = await yeniSosyalMedya.save();
      res.json(sosyalMedya);
    } catch (err) {
      logger.error("Organizasyon sosyal medya hesabı eklenirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
