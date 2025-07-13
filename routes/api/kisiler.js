const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check } = require("express-validator");
const validationErrorHandler = require("../../middleware/validationErrorHandler");
const fs = require("fs");
const path = require("path");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const Kisi = require("../../models/Kisi");
const Grup = require("../../models/Grup");
const Adres = require("../../models/Adres");
const Telefon = require("../../models/Telefon");
const SosyalMedya = require("../../models/SosyalMedya");
const multer = require("multer");
// const KisiEk = require("../../models/KisiEk");
// const Dokuman = require("../../models/Dokuman");

// Dosya yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/kisiler");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeFilename = file.originalname.replace(
      /[&\/\\#,+()$~%'":*?<>{}]/g,
      "_"
    );
    cb(null, uniqueSuffix + "-" + safeFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Geçersiz dosya tipi: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// @route   GET api/kisiler/aktif
// @desc    Aktif kişileri getir
// @access  Özel
router.get(
  "/aktif",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const kisiler = await Kisi.findAll({
        where: { isActive: true },
        include: [
          {
            model: Grup,
            as: "grup",
            attributes: ["grupAdi"],
          },
        ],
        order: [["ad", "ASC"]],
      });
      res.json(kisiler);
    } catch (err) {
      logger.error("Aktif kişiler getirilirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler
// @desc    Tüm kişileri getir
// @access  Özel
router.get("/", auth, yetkiKontrol("kisiler_goruntuleme"), async (req, res) => {
  try {
    const kisiler = await Kisi.findAll({
      include: [
        {
          model: Grup,
          as: "grup",
        },
      ],
      order: [
        ["ad", "ASC"],
        ["soyad", "ASC"],
      ],
    });
    res.json(kisiler);
  } catch (err) {
    logger.error("Kişiler getirilirken hata", { error: err.message });
    res.status(500).json({ msg: "Sunucu hatası", error: err.message });
  }
});

// @route   GET api/kisiler/:id
// @desc    ID'ye göre kişi getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const kisi = await Kisi.findByPk(req.params.id, {
        include: [
          {
            model: Grup,
            as: "grup",
            attributes: ["grupAdi"],
          },
        ],
      });

      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      res.json(kisi);
    } catch (err) {
      logger.error("Kişi getirilirken hata", { error: err.message });
      // UUID validation check for Sequelize
      if (
        err.name === "SequelizeDatabaseError" ||
        err.name === "SequelizeValidationError"
      ) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler
// @desc    Yeni kişi ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("kisiler_ekleme"),
    [
      check("ad", "Ad alanı gereklidir").not().isEmpty(),
      check("soyad", "Soyad alanı gereklidir").not().isEmpty(),
    ],
  ],
  validationErrorHandler,
  async (req, res) => {
    const {
      ad,
      soyad,
      tcKimlik,
      email,
      dogumTarihi,
      dogumYeri,
      cinsiyet,
      medeniDurum,
      kanGrubu,
      anaAd,
      babaAdi,
      telefonNumarasi,
      babasininTelefonNumarasi,
      adres,
      nufusIl,
      nufusIlce,
      nufusMahalleKoy,
      ciltNo,
      aileSiraNo,
      sayfaNo,
      seriNo,
      cuzdanNo,
      verildigiYer,
      kayitNo,
      verilmeTarihi,
      verilmeNedeni,
      aciklamalar,
      dosyaNo,
      grup_id,
      baslamaTarihi,
      bitisTarihi,
      isActive,
    } = req.body;

    try {
      // Grup kontrolünü boş string değil sadece geçerli bir id varsa yap
      if (grup_id && grup_id !== "") {
        const grup = await Grup.findById(grup_id);
        if (!grup) {
          return res.status(404).json({ msg: "Belirtilen grup bulunamadı" });
        }
      }

      // Kişi verilerini hazırla
      const kisiVerileri = {
        ad,
        soyad,
        tcKimlik,
        email,
        dogumTarihi,
        dogumYeri,
        cinsiyet,
        medeniDurum,
        kanGrubu,
        anaAd,
        babaAdi,
        telefonNumarasi,
        babasininTelefonNumarasi,
        adres,
        nufusIl,
        nufusIlce,
        nufusMahalleKoy,
        ciltNo,
        aileSiraNo,
        sayfaNo,
        seriNo,
        cuzdanNo,
        verildigiYer,
        kayitNo,
        verilmeTarihi,
        verilmeNedeni,
        aciklamalar,
        dosyaNo,
        baslamaTarihi,
        bitisTarihi,
        isActive: isActive !== undefined ? isActive : true,
      };

      // Grup ID boş değilse ekle
      if (grup_id && grup_id !== "") {
        kisiVerileri.grup_id = grup_id;
      }

      // Yeni kişi oluştur
      const kisi = await Kisi.create(kisiVerileri);

      res.json(kisi);
    } catch (err) {
      logger.error("Yeni kişi eklenirken hata", { error: err.message });
      if (err.name === "SequelizeValidationError") {
        return res
          .status(400)
          .json({ msg: "Veri doğrulama hatası", error: err.message });
      } else if (err.name === "SequelizeDatabaseError") {
        return res
          .status(500)
          .json({ msg: "Veritabanı hatası", error: err.message });
      }
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   PUT api/kisiler/:id
// @desc    Kişi bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("kisiler_guncelleme"),
  [
    check("ad", "Ad alanı gereklidir").not().isEmpty(),
    check("soyad", "Soyad alanı gereklidir").not().isEmpty(),
  ],
  validationErrorHandler,
  async (req, res) => {
    const {
      ad,
      soyad,
      tcKimlik,
      email,
      dogumTarihi,
      dogumYeri,
      cinsiyet,
      medeniDurum,
      kanGrubu,
      anaAd,
      babaAdi,
      telefonNumarasi,
      babasininTelefonNumarasi,
      adres,
      nufusIl,
      nufusIlce,
      nufusMahalleKoy,
      ciltNo,
      aileSiraNo,
      sayfaNo,
      seriNo,
      cuzdanNo,
      verildigiYer,
      kayitNo,
      verilmeTarihi,
      verilmeNedeni,
      aciklamalar,
      dosyaNo,
      grup_id,
      baslamaTarihi,
      bitisTarihi,
      isActive,
    } = req.body;

    // Kişi bilgilerini güncelleme
    const kisiGuncelleme = {};
    if (ad) kisiGuncelleme.ad = ad;
    if (soyad) kisiGuncelleme.soyad = soyad;
    if (tcKimlik) kisiGuncelleme.tcKimlik = tcKimlik;
    if (email) kisiGuncelleme.email = email;
    if (dogumTarihi) kisiGuncelleme.dogumTarihi = dogumTarihi;
    if (dogumYeri) kisiGuncelleme.dogumYeri = dogumYeri;
    if (cinsiyet) kisiGuncelleme.cinsiyet = cinsiyet;
    if (medeniDurum) kisiGuncelleme.medeniDurum = medeniDurum;
    if (kanGrubu) kisiGuncelleme.kanGrubu = kanGrubu;
    if (anaAd) kisiGuncelleme.anaAd = anaAd;
    if (babaAdi) kisiGuncelleme.babaAdi = babaAdi;
    if (telefonNumarasi) kisiGuncelleme.telefonNumarasi = telefonNumarasi;
    if (babasininTelefonNumarasi)
      kisiGuncelleme.babasininTelefonNumarasi = babasininTelefonNumarasi;
    if (adres) kisiGuncelleme.adres = adres;
    if (nufusIl) kisiGuncelleme.nufusIl = nufusIl;
    if (nufusIlce) kisiGuncelleme.nufusIlce = nufusIlce;
    if (nufusMahalleKoy) kisiGuncelleme.nufusMahalleKoy = nufusMahalleKoy;
    if (ciltNo) kisiGuncelleme.ciltNo = ciltNo;
    if (aileSiraNo) kisiGuncelleme.aileSiraNo = aileSiraNo;
    if (sayfaNo) kisiGuncelleme.sayfaNo = sayfaNo;
    if (seriNo) kisiGuncelleme.seriNo = seriNo;
    if (cuzdanNo) kisiGuncelleme.cuzdanNo = cuzdanNo;
    if (verildigiYer) kisiGuncelleme.verildigiYer = verildigiYer;
    if (kayitNo) kisiGuncelleme.kayitNo = kayitNo;
    if (verilmeTarihi) kisiGuncelleme.verilmeTarihi = verilmeTarihi;
    if (verilmeNedeni) kisiGuncelleme.verilmeNedeni = verilmeNedeni;
    if (aciklamalar) kisiGuncelleme.aciklamalar = aciklamalar;
    if (dosyaNo) kisiGuncelleme.dosyaNo = dosyaNo;

    // Grup ID kontrolü - boş string ise grup_id alanını temizle
    if (grup_id === "") {
      kisiGuncelleme.grup_id = null;
    } else if (grup_id) {
      kisiGuncelleme.grup_id = grup_id;
    }

    if (baslamaTarihi) kisiGuncelleme.baslamaTarihi = baslamaTarihi;
    if (bitisTarihi) kisiGuncelleme.bitisTarihi = bitisTarihi;
    if (isActive !== undefined) kisiGuncelleme.isActive = isActive;

    try {
      // Kişi var mı kontrolü
      let kisi = await Kisi.findByPk(req.params.id);

      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Eğer grup_id belirtilmişse ve boş değilse, grubun var olup olmadığını kontrol et
      if (grup_id && grup_id !== "") {
        const grup = await Grup.findByPk(grup_id);
        if (!grup) {
          return res.status(404).json({ msg: "Belirtilen grup bulunamadı" });
        }
      }

      // Güncelleme yap
      await kisi.update(kisiGuncelleme);

      // Güncellenmiş kişiyi grup bilgisiyle beraber getir
      const guncelKisi = await Kisi.findByPk(req.params.id, {
        include: [
          {
            model: Grup,
            as: "grup",
          },
        ],
      });

      res.json(guncelKisi);
    } catch (err) {
      logger.error("Kişi güncellenirken hata", { error: err.message });
      if (
        err.name === "SequelizeDatabaseError" ||
        err.name === "SequelizeValidationError"
      ) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   DELETE api/kisiler/:id
// @desc    Kişi sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("kisiler_silme"), async (req, res) => {
  try {
    // Kişi var mı kontrolü
    const kisi = await Kisi.findById(req.params.id);

    if (!kisi) {
      return res.status(404).json({ msg: "Kişi bulunamadı" });
    }

    // Kişiyi sil
    await kisi.remove();
    res.json({ msg: "Kişi silindi" });
  } catch (err) {
    logger.error("Kişi silinirken hata", { error: err.message });
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Kişi bulunamadı" });
    }
    res.status(500).json({ msg: "Sunucu hatası", error: err.message });
  }
});

// @route   GET api/kisiler/grup/:grup_id
// @desc    Gruba göre kişileri getir
// @access  Özel
router.get(
  "/grup/:grup_id",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const kisiler = await Kisi.find({ grup_id: req.params.grup_id })
        .populate("grup_id", ["grupAdi"])
        .sort({ ad: 1 });

      res.json(kisiler);
    } catch (err) {
      logger.error("Gruba göre kişiler getirilirken hata", {
        error: err.message,
      });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Grup bulunamadı" });
      }
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// Çoklu kişi silme endpointi
// @route   DELETE api/kisiler/bulk
// @desc    Birden fazla kişiyi sil
// @access  Özel
router.delete(
  "/bulk",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ msg: "Silinecek kişiler belirtilmedi" });
      }

      // Her bir kişiyi silme işlemi
      const silmeIslemleri = ids.map((id) => Kisi.findByIdAndRemove(id));
      await Promise.all(silmeIslemleri);

      res.json({ msg: "Kişiler başarıyla silindi" });
    } catch (err) {
      logger.error("Birden fazla kişi silinirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/adresler
// @desc    Kişiye ait tüm adresleri getir
// @access  Özel
router.get(
  "/:kisi_id/adresler",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const adresler = await Adres.find({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
      }).sort({ kayitTarihi: -1 });

      res.json(adresler);
    } catch (err) {
      logger.error("Adresler getirilirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler/:kisi_id/adresler
router.post(
  "/:kisi_id/adresler",
  [
    auth,
    yetkiKontrol("kisiler_ekleme"),
    [
      check("adres", "Adres bilgisi gereklidir").not().isEmpty(),
      check("il", "İl bilgisi gereklidir").not().isEmpty(),
      check("ilce", "İlçe bilgisi gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Kişi kontrolü
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Yeni adres oluştur
      const yeniAdres = new Adres({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
        adres: req.body.adres,
        il: req.body.il,
        ilce: req.body.ilce,
        mahallekoy: req.body.mahallekoy || "",
        sokak: req.body.sokak || "",
        apartman: req.body.apartman || "",
        daire: req.body.daire || "",
        postaKodu: req.body.postaKodu,
        ulke: req.body.ulke || "Türkiye",
        tur: req.body.tur || "İş",
        lokasyon: req.body.lokasyon,
        aciklama: req.body.aciklama,
        varsayilan: req.body.varsayilan || false,
        durumu: req.body.durumu || "Aktif",
      });

      await yeniAdres.save();
      res.json(yeniAdres);
    } catch (err) {
      logger.error("Adres kaydedilirken hata", { error: err.message });
      res.status(500).json({
        msg: "Adres kaydedilirken bir hata oluştu",
        error: err.message,
      });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/telefonlar
// @desc    Kişiye ait tüm telefonları getir
// @access  Özel
router.get(
  "/:kisi_id/telefonlar",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const telefonlar = await Telefon.find({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
      }).sort({ kayitTarihi: -1 });

      res.json(telefonlar);
    } catch (err) {
      logger.error("Telefonlar getirilirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler/:kisi_id/telefonlar
// @desc    Kişiye yeni telefon ekle
// @access  Özel
router.post(
  "/:kisi_id/telefonlar",
  [
    auth,
    yetkiKontrol("kisiler_ekleme"),
    [check("telefonNumarasi", "Telefon numarası gereklidir").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { telefonNumarasi, tur, durumu, aciklama } = req.body;

      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Yeni telefon oluştur
      const yeniTelefon = new Telefon({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
        telefonNumarasi,
        tur: tur || "Cep",
        durumu: durumu || "Aktif",
        aciklama,
      });

      await yeniTelefon.save();
      res.json(yeniTelefon);
    } catch (err) {
      logger.error("Telefon eklenirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/sosyal-medya
// @desc    Kişiye ait tüm sosyal medya hesaplarını getir
// @access  Özel
router.get(
  "/:kisi_id/sosyal-medya",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const sosyalMedyalar = await SosyalMedya.find({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
      }).sort({ kayitTarihi: -1 });

      res.json(sosyalMedyalar);
    } catch (err) {
      logger.error("Sosyal medya hesapları getirilirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler/:kisi_id/sosyal-medya
// @desc    Kişiye yeni sosyal medya hesabı ekle
// @access  Özel
router.post(
  "/:kisi_id/sosyal-medya",
  [
    auth,
    yetkiKontrol("kisiler_ekleme"),
    [
      check("kullaniciAdi", "Kullanıcı adı veya hesap bilgisi gereklidir")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { kullaniciAdi, url, tur, aciklama, durumu } = req.body;

      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Yeni sosyal medya oluştur
      const yeniSosyalMedya = new SosyalMedya({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
        kullaniciAdi,
        url,
        tur: tur || "Website",
        aciklama,
        durumu: durumu || "Aktif",
      });

      await yeniSosyalMedya.save();
      res.json(yeniSosyalMedya);
    } catch (err) {
      logger.error("Sosyal medya hesabı eklenirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   PUT api/kisiler/:kisi_id/adresler/:adres_id
// @desc    Kişiye ait adres bilgisini güncelle
// @access  Özel
router.put(
  "/:kisi_id/adresler/:adres_id",
  auth,
  yetkiKontrol("kisiler_guncelleme"),
  async (req, res) => {
    try {
      // Kişi kontrolü
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Adres kontrolü
      const adres = await Adres.findById(req.params.adres_id);
      if (!adres) {
        return res.status(404).json({ msg: "Adres bulunamadı" });
      }

      // Adresin ilişkili olduğu kişi doğru mu?
      if (
        adres.referansId.toString() !== req.params.kisi_id ||
        adres.referansTur !== "Kisi"
      ) {
        return res.status(400).json({ msg: "Bu adres bu kişiye ait değil" });
      }

      // Güncelleme verisi
      const adresUpdate = {
        adres: req.body.adres,
        il: req.body.il,
        ilce: req.body.ilce,
        postaKodu: req.body.postaKodu,
        ulke: req.body.ulke || "Türkiye",
        tur: req.body.tur || "İş",
        lokasyon: req.body.lokasyon,
        aciklama: req.body.aciklama,
        varsayilan: req.body.varsayilan || false,
        durumu: req.body.durumu || "Aktif",
      };

      // Varsayılan adres işaretlendiyse diğerlerini güncelle
      if (adresUpdate.varsayilan) {
        await Adres.updateMany(
          {
            referansId: req.params.kisi_id,
            referansTur: "Kisi",
            _id: { $ne: req.params.adres_id },
            varsayilan: true,
          },
          { $set: { varsayilan: false } }
        );
      }

      // Adresi güncelle
      const updatedAdres = await Adres.findByIdAndUpdate(
        req.params.adres_id,
        { $set: adresUpdate },
        { new: true }
      );

      res.json(updatedAdres);
    } catch (err) {
      logger.error("Adres güncellenirken hata", { error: err.message });
      res.status(500).json({
        msg: "Adres güncellenirken bir hata oluştu",
        error: err.message,
      });
    }
  }
);

// @route   DELETE api/kisiler/:kisi_id/adresler/:adres_id
// @desc    Kişi adresini sil
// @access  Özel
router.delete(
  "/:kisi_id/adresler/:adres_id",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      const adres = await Adres.findById(req.params.adres_id);

      if (!adres) {
        return res.status(404).json({ msg: "Adres bulunamadı" });
      }

      // Adresi sil
      await adres.remove();
      res.json({ msg: "Adres başarıyla silindi" });
    } catch (err) {
      logger.error("Adres silinirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/telefonlar/:telefon_id
// @desc    Kişiye ait belirli bir telefon bilgisini getir
// @access  Özel
router.get(
  "/:kisi_id/telefonlar/:telefon_id",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const telefon = await Telefon.findById(req.params.telefon_id);

      if (!telefon) {
        return res.status(404).json({ msg: "Telefon bilgisi bulunamadı" });
      }

      // Telefonun ilişkili olduğu kişi doğru mu?
      if (
        telefon.referansId.toString() !== req.params.kisi_id ||
        telefon.referansTur !== "Kisi"
      ) {
        return res.status(400).json({ msg: "Bu telefon bu kişiye ait değil" });
      }

      res.json(telefon);
    } catch (err) {
      logger.error("Telefon bilgisi getirilirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   PUT api/kisiler/:kisi_id/telefonlar/:telefon_id
// @desc    Kişiye ait telefon bilgisini güncelle
// @access  Özel
router.put(
  "/:kisi_id/telefonlar/:telefon_id",
  auth,
  yetkiKontrol("kisiler_guncelleme"),
  async (req, res) => {
    try {
      const { telefonNumarasi, tur, durumu, aciklama } = req.body;

      // Telefon bilgilerini güncelleme
      const telefonGuncelleme = {};
      if (telefonNumarasi) telefonGuncelleme.telefonNumarasi = telefonNumarasi;
      if (tur) telefonGuncelleme.tur = tur;
      if (durumu) telefonGuncelleme.durumu = durumu;
      if (aciklama !== undefined) telefonGuncelleme.aciklama = aciklama;

      // Telefon var mı kontrolü
      let telefon = await Telefon.findById(req.params.telefon_id);
      if (!telefon) {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }

      // Telefonun ilişkili olduğu kişi doğru mu?
      if (
        telefon.referansId.toString() !== req.params.kisi_id ||
        telefon.referansTur !== "Kisi"
      ) {
        return res.status(400).json({ msg: "Bu telefon bu kişiye ait değil" });
      }

      // Güncelleme yap
      telefon = await Telefon.findByIdAndUpdate(
        req.params.telefon_id,
        { $set: telefonGuncelleme },
        { new: true }
      );

      res.json(telefon);
    } catch (err) {
      logger.error("Telefon bilgisi güncellenirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   DELETE api/kisiler/:kisi_id/telefonlar/:telefon_id
// @desc    Kişiye ait telefon bilgisini sil
// @access  Özel
router.delete(
  "/:kisi_id/telefonlar/:telefon_id",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      // Telefon var mı kontrolü
      const telefon = await Telefon.findById(req.params.telefon_id);
      if (!telefon) {
        return res.status(404).json({ msg: "Telefon bulunamadı" });
      }

      // Telefonun ilişkili olduğu kişi doğru mu?
      if (
        telefon.referansId.toString() !== req.params.kisi_id ||
        telefon.referansTur !== "Kisi"
      ) {
        return res.status(400).json({ msg: "Bu telefon bu kişiye ait değil" });
      }

      // Telefonu sil
      await telefon.remove();
      res.json({ msg: "Telefon bilgisi silindi" });
    } catch (err) {
      logger.error("Telefon bilgisi silinirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/sosyal-medya/:sosyalmedya_id
// @desc    Kişiye ait belirli bir sosyal medya bilgisini getir
// @access  Özel
router.get(
  "/:kisi_id/sosyal-medya/:sosyalmedya_id",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const sosyalMedya = await SosyalMedya.findById(req.params.sosyalmedya_id);

      if (!sosyalMedya) {
        return res.status(404).json({ msg: "Sosyal medya bilgisi bulunamadı" });
      }

      // Sosyal medyanın ilişkili olduğu kişi doğru mu?
      if (
        sosyalMedya.referansId.toString() !== req.params.kisi_id ||
        sosyalMedya.referansTur !== "Kisi"
      ) {
        return res
          .status(400)
          .json({ msg: "Bu sosyal medya hesabı bu kişiye ait değil" });
      }

      res.json(sosyalMedya);
    } catch (err) {
      logger.error("Sosyal medya bilgisi getirilirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   PUT api/kisiler/:kisi_id/sosyal-medya/:sosyalmedya_id
// @desc    Kişiye ait sosyal medya bilgisini güncelle
// @access  Özel
router.put(
  "/:kisi_id/sosyal-medya/:sosyalmedya_id",
  auth,
  yetkiKontrol("kisiler_guncelleme"),
  async (req, res) => {
    try {
      const { kullaniciAdi, url, tur, aciklama, durumu } = req.body;

      // Sosyal medya bilgilerini güncelleme
      const sosyalMedyaGuncelleme = {};
      if (kullaniciAdi) sosyalMedyaGuncelleme.kullaniciAdi = kullaniciAdi;
      if (url) sosyalMedyaGuncelleme.url = url;
      if (tur) sosyalMedyaGuncelleme.tur = tur;
      if (aciklama !== undefined) sosyalMedyaGuncelleme.aciklama = aciklama;
      if (durumu) sosyalMedyaGuncelleme.durumu = durumu;

      // Sosyal medya var mı kontrolü
      let sosyalMedya = await SosyalMedya.findById(req.params.sosyalmedya_id);
      if (!sosyalMedya) {
        return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
      }

      // Sosyal medyanın ilişkili olduğu kişi doğru mu?
      if (
        sosyalMedya.referansId.toString() !== req.params.kisi_id ||
        sosyalMedya.referansTur !== "Kisi"
      ) {
        return res
          .status(400)
          .json({ msg: "Bu sosyal medya hesabı bu kişiye ait değil" });
      }

      // Güncelleme yap
      sosyalMedya = await SosyalMedya.findByIdAndUpdate(
        req.params.sosyalmedya_id,
        { $set: sosyalMedyaGuncelleme },
        { new: true }
      );

      res.json(sosyalMedya);
    } catch (err) {
      logger.error("Sosyal medya bilgisi güncellenirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   DELETE api/kisiler/:kisi_id/sosyal-medya/:sosyalmedya_id
// @desc    Kişiye ait sosyal medya bilgisini sil
// @access  Özel
router.delete(
  "/:kisi_id/sosyal-medya/:sosyalmedya_id",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      const sosyalMedya = await SosyalMedya.findById(req.params.sosyalmedya_id);

      if (!sosyalMedya) {
        return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
      }

      // Sosyal medyanın ilişkili olduğu kişi doğru mu?
      if (
        sosyalMedya.referansId.toString() !== req.params.kisi_id ||
        sosyalMedya.referansTur !== "Kisi"
      ) {
        return res.status(400).json({
          msg: "Bu sosyal medya hesabı bu kişiye ait değil",
        });
      }

      await sosyalMedya.remove();
      res.json({ msg: "Sosyal medya hesabı silindi" });
    } catch (err) {
      logger.error("Sosyal medya hesabı silinirken hata", {
        error: err.message,
      });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Sosyal medya hesabı bulunamadı" });
      }
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/adresler/aktif
// @desc    Kişiye ait tüm aktif adresleri getir
// @access  Özel
router.get(
  "/:kisi_id/adresler/aktif",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const adresler = await Adres.find({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
        durumu: "Aktif",
      }).sort({ createdAt: -1 });

      res.json(adresler);
    } catch (err) {
      logger.error("Aktif adresler getirilirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/telefonlar/aktif
// @desc    Kişiye ait tüm aktif telefonları getir
// @access  Özel
router.get(
  "/:kisi_id/telefonlar/aktif",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const telefonlar = await Telefon.find({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
        durumu: "Aktif",
      }).sort({ createdAt: -1 });

      res.json(telefonlar);
    } catch (err) {
      logger.error("Aktif telefonlar getirilirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:kisi_id/sosyal-medya/aktif
// @desc    Kişiye ait tüm aktif sosyal medya hesaplarını getir
// @access  Özel
router.get(
  "/:kisi_id/sosyal-medya/aktif",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const sosyalMedyalar = await SosyalMedya.find({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
        durumu: "Aktif",
      }).sort({ createdAt: -1 });

      res.json(sosyalMedyalar);
    } catch (err) {
      logger.error("Aktif sosyal medya hesapları getirilirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler/:kisi_id/bulk-adres
// @desc    Kişiye toplu adres ekle
// @access  Özel
router.post(
  "/:kisi_id/bulk-adres",
  auth,
  yetkiKontrol("kisiler_ekleme"),
  async (req, res) => {
    try {
      const { adresler } = req.body;

      if (!Array.isArray(adresler) || adresler.length === 0) {
        return res.status(400).json({ msg: "Eklenecek adres bulunamadı" });
      }

      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      const eklenenAdresler = [];

      // Her adres için yeni kayıt oluştur
      for (const adres of adresler) {
        const yeniAdres = new Adres({
          referansId: req.params.kisi_id,
          referansTur: "Kisi",
          il: adres.il,
          ilce: adres.ilce,
          mahallekoy: adres.mahallekoy,
          sokak: adres.sokak,
          apartman: adres.apartman,
          daire: adres.daire,
          adresAciklama: adres.adresAciklama,
          adresMernis: adres.adresMernis,
          durumu: adres.durumu || "Aktif",
        });

        await yeniAdres.save();
        eklenenAdresler.push(yeniAdres);
      }

      res.json(eklenenAdresler);
    } catch (err) {
      logger.error("Toplu adres eklenirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler/:kisi_id/bulk-telefon
// @desc    Kişiye toplu telefon ekle
// @access  Özel
router.post(
  "/:kisi_id/bulk-telefon",
  auth,
  yetkiKontrol("kisiler_ekleme"),
  async (req, res) => {
    try {
      const { telefonlar } = req.body;

      if (!Array.isArray(telefonlar) || telefonlar.length === 0) {
        return res.status(400).json({ msg: "Eklenecek telefon bulunamadı" });
      }

      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      const eklenenTelefonlar = [];

      // Her telefon için yeni kayıt oluştur
      for (const telefon of telefonlar) {
        const yeniTelefon = new Telefon({
          referansId: req.params.kisi_id,
          referansTur: "Kisi",
          telefonNumarasi: telefon.telefonNumarasi,
          tur: telefon.tur || "Cep",
          durumu: telefon.durumu || "Aktif",
          aciklama: telefon.aciklama,
        });

        await yeniTelefon.save();
        eklenenTelefonlar.push(yeniTelefon);
      }

      res.json(eklenenTelefonlar);
    } catch (err) {
      logger.error("Toplu telefon eklenirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler/:kisi_id/bulk-sosyal-medya
// @desc    Kişiye toplu sosyal medya ekle
// @access  Özel
router.post(
  "/:kisi_id/bulk-sosyal-medya",
  auth,
  yetkiKontrol("kisiler_ekleme"),
  async (req, res) => {
    try {
      const { sosyalMedyalar } = req.body;

      if (!Array.isArray(sosyalMedyalar) || sosyalMedyalar.length === 0) {
        return res
          .status(400)
          .json({ msg: "Eklenecek sosyal medya bilgisi bulunamadı" });
      }

      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      const eklenenSosyalMedyalar = [];

      // Her sosyal medya için yeni kayıt oluştur
      for (const sosyalMedya of sosyalMedyalar) {
        const yeniSosyalMedya = new SosyalMedya({
          referansId: req.params.kisi_id,
          referansTur: "Kisi",
          kullaniciAdi: sosyalMedya.kullaniciAdi,
          url: sosyalMedya.url,
          tur: sosyalMedya.tur || "Diğer",
          aciklama: sosyalMedya.aciklama,
          durumu: sosyalMedya.durumu || "Aktif",
        });

        await yeniSosyalMedya.save();
        eklenenSosyalMedyalar.push(yeniSosyalMedya);
      }

      res.json(eklenenSosyalMedyalar);
    } catch (err) {
      logger.error("Toplu sosyal medya eklenirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   DELETE api/kisiler/:kisi_id/telefonlar
// @desc    Kişiye ait tüm telefonları sil
// @access  Özel
router.delete(
  "/:kisi_id/telefonlar",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Kişiye ait tüm telefonları bul ve sil
      const result = await Telefon.deleteMany({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
      });

      res.json({ msg: `${result.deletedCount} telefon kaydı silindi` });
    } catch (err) {
      logger.error("Tüm telefonlar silinirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   DELETE api/kisiler/:kisi_id/adresler
// @desc    Kişiye ait tüm adresleri sil
// @access  Özel
router.delete(
  "/:kisi_id/adresler",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Kişiye ait tüm adresleri bul ve sil
      const result = await Adres.deleteMany({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
      });

      res.json({ msg: `${result.deletedCount} adres kaydı silindi` });
    } catch (err) {
      logger.error("Tüm adresler silinirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   DELETE api/kisiler/:kisi_id/sosyal-medya
// @desc    Kişiye ait tüm sosyal medya hesaplarını sil
// @access  Özel
router.delete(
  "/:kisi_id/sosyal-medya",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      // Kişi var mı kontrol et
      const kisi = await Kisi.findById(req.params.kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Kişiye ait tüm sosyal medya hesaplarını bul ve sil
      const result = await SosyalMedya.deleteMany({
        referansId: req.params.kisi_id,
        referansTur: "Kisi",
      });

      res.json({ msg: `${result.deletedCount} sosyal medya kaydı silindi` });
    } catch (err) {
      logger.error("Tüm sosyal medya hesapları silinirken hata", {
        error: err.message,
      });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   POST api/kisiler/:id/ekler
// @desc    Kişiye dosya ekle
// @access  Özel
router.post(
  "/:id/ekler",
  [auth, yetkiKontrol("kisiler_ekleme"), upload.single("dosya")],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { aciklama } = req.body;
      const file = req.file;

      let ekTur = "Diğer";
      if (file.mimetype.startsWith("image/")) {
        ekTur = "Resim";
      } else if (file.mimetype.startsWith("video/")) {
        ekTur = "Video";
      } else if (file.mimetype.startsWith("audio/")) {
        ekTur = "Ses";
      } else if (
        file.mimetype.includes("pdf") ||
        file.mimetype.includes("document") ||
        file.mimetype.includes("sheet") ||
        file.mimetype.includes("presentation")
      ) {
        ekTur = "Belge";
      }

      const yeniEk = new KisiEk({
        referansId: id,
        referansTur: "Kisi",
        dosyaAdi: file.filename,
        orijinalDosyaAdi: file.originalname,
        dosyaYolu: file.path
          .replace(/\\/g, "/")
          .replace(/^.*\/uploads/, "uploads"),
        dosyaBoyutu: file.size,
        mimeTur: file.mimetype,
        ekTur,
        aciklama,
      });

      await yeniEk.save();
      res.json(yeniEk);
    } catch (err) {
      logger.error("Dosya eklenirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   GET api/kisiler/:id/ekler
// @desc    Kişinin dosyalarını getir
// @access  Özel
router.get(
  "/:id/ekler",
  auth,
  yetkiKontrol("kisiler_goruntuleme"),
  async (req, res) => {
    try {
      const ekler = await KisiEk.find({
        referansId: req.params.id,
        referansTur: "Kisi",
      });
      res.json(ekler);
    } catch (err) {
      logger.error("Dosyalar getirilirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// @route   DELETE api/kisiler/ekler/:id
// @desc    Dosya sil
// @access  Özel
router.delete(
  "/ekler/:id",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      const ek = await KisiEk.findById(req.params.id);
      if (!ek) {
        return res.status(404).json({ msg: "Dosya bulunamadı" });
      }

      await ek.remove();
      res.json({ msg: "Dosya silindi" });
    } catch (err) {
      logger.error("Dosya silinirken hata", { error: err.message });
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// Çoklu doküman yükleme endpoint'i
router.post(
  "/:id/dokumanlar/bulk",
  [auth, yetkiKontrol("kisiler_ekleme"), upload.array("dokumanlar", 10)],
  async (req, res) => {
    try {
      const { id } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ msg: "Lütfen en az bir dosya yükleyin" });
      }

      // Kişiyi bul ve dokumanlar dizisinin varlığını kontrol et
      const kisi = await Kisi.findById(id);
      if (!kisi) {
        // Yüklenen dosyaları temizle
        files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            logger.error(`Dosya silinirken hata: ${file.path}`, {
              error: err.message,
            });
          }
        });
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Eğer dokumanlar dizisi yoksa oluştur
      if (!kisi.dokumanlar) {
        kisi.dokumanlar = [];
      }

      const eklenenDokumanlar = [];
      const aciklamalar = {};

      // Açıklamaları topla
      Object.keys(req.body).forEach((key) => {
        if (key.startsWith("aciklama_")) {
          const index = key.split("_")[1];
          aciklamalar[index] = req.body[key];
        }
      });

      // Dosyaları ekle
      files.forEach((file, index) => {
        const yeniDokuman = {
          dosyaYolu: file.path,
          orijinalDosyaAdi: file.originalname,
          dosyaTipi: file.mimetype,
          dosyaBoyutu: file.size,
          yuklemeTarihi: Date.now(),
          aciklama: aciklamalar[index] || "",
        };

        kisi.dokumanlar.push(yeniDokuman);
        eklenenDokumanlar.push(yeniDokuman);
      });

      await kisi.save();

      res.json({
        msg: `${eklenenDokumanlar.length} doküman başarıyla yüklendi`,
        dokumanlar: eklenenDokumanlar,
      });
    } catch (err) {
      logger.error("Doküman yüklenirken hata", { error: err.message });

      // Hata durumunda dosyaları temizle
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (deleteErr) {
            logger.error(`Dosya silinirken hata: ${file.path}`, {
              error: deleteErr.message,
            });
          }
        });
      }

      res.status(500).json({
        msg: "Dokümanlar yüklenirken bir hata oluştu",
        detail: err.message,
      });
    }
  }
);

// @route   DELETE api/kisiler/:id/dokumanlar/:dokumanId
// @desc    Kişinin dokümanını sil
// @access  Özel
router.delete(
  "/:id/dokumanlar/:dokumanId",
  auth,
  yetkiKontrol("kisiler_silme"),
  async (req, res) => {
    try {
      const kisi = await Kisi.findById(req.params.id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      // Dokümanı bul
      const dokuman = kisi.dokumanlar.id(req.params.dokumanId);
      if (!dokuman) {
        return res.status(404).json({ msg: "Doküman bulunamadı" });
      }

      // Fiziksel dosyayı sil
      try {
        if (dokuman.dosyaYolu && fs.existsSync(dokuman.dosyaYolu)) {
          fs.unlinkSync(dokuman.dosyaYolu);
        }
      } catch (err) {
        logger.error("Dosya silinirken hata", { error: err.message });
      }

      // Dokümanı array'den kaldır
      kisi.dokumanlar.pull(req.params.dokumanId);
      await kisi.save();

      res.json({ _id: req.params.dokumanId, msg: "Doküman başarıyla silindi" });
    } catch (err) {
      logger.error("Doküman silinirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Geçersiz ID formatı" });
      }
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

// Dosya boyutunu formatlama yardımcı fonksiyonu
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
}

module.exports = router;
