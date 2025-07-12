const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Toplanti = require("../../models/Toplanti");
const ToplantiDetay = require("../../models/ToplantiDetay");
const Katilimci = require("../../models/Katilimci");
const Kisi = require("../../models/Kisi");
const Sube = require("../../models/Sube");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

// @route   GET api/toplantilar
// @desc    Tüm toplantıları getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("toplantilar_goruntuleme"),
  async (req, res) => {
    try {
      const toplantilar = await Toplanti.find().sort({ tarih: -1 });
      res.json(toplantilar);
    } catch (err) {
      logger.error("Toplantılar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/toplantilar/:id
// @desc    ID'ye göre toplantı getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("toplantilar_goruntuleme"),
  async (req, res) => {
    try {
      const toplanti = await Toplanti.findById(req.params.id);
      if (!toplanti) {
        return res.status(404).json({ msg: "Toplantı kaydı bulunamadı" });
      }
      res.json(toplanti);
    } catch (err) {
      logger.error("Toplantı getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Toplantı kaydı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/toplantilar/kararlar/:toplanti_id
// @desc    Toplantıya ait kararları getir
// @access  Özel
router.get(
  "/kararlar/:toplanti_id",
  auth,
  yetkiKontrol("toplantilar_goruntuleme"),
  async (req, res) => {
    try {
      const kararlar = await ToplantiDetay.find({
        toplanti_id: req.params.toplanti_id,
      });
      res.json(kararlar);
    } catch (err) {
      logger.error("Kararlar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/toplantilar/katilimcilar/:toplanti_id
// @desc    Toplantıya ait katılımcıları getir
// @access  Özel
router.get(
  "/katilimcilar/:toplanti_id",
  auth,
  yetkiKontrol("toplantilar_goruntuleme"),
  async (req, res) => {
    try {
      const katilimcilar = await Katilimci.find({
        toplanti_id: req.params.toplanti_id,
      }).populate("kisi_id", ["ad", "soyad", "email", "rol_id"]);
      res.json(katilimcilar);
    } catch (err) {
      logger.error("Katılımcılar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/toplantilar
// @desc    Yeni toplantı kaydı ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("toplantilar_ekleme"),
    [
      check("toplantiTuru", "Toplantı türü gereklidir").not().isEmpty(),
      check("tarih", "Tarih gereklidir").not().isEmpty(),
      check("baslamaSaati", "Başlama saati gereklidir").not().isEmpty(),
      check("bitisSaati", "Bitiş saati gereklidir").not().isEmpty(),
      check("toplantiYeri", "Toplantı yeri gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      toplantiTuru,
      aciklama,
      tarih,
      baslamaSaati,
      bitisSaati,
      oturumNo,
      toplantiYeri,
      gundem,
      isActive,
    } = req.body;

    try {
      // Yeni toplantı kaydı oluştur
      const yeniToplanti = new Toplanti({
        toplantiTuru,
        aciklama,
        tarih,
        baslamaSaati,
        bitisSaati,
        oturumNo,
        toplantiYeri,
        gundem,
        isActive: isActive !== undefined ? isActive : true,
      });

      await yeniToplanti.save();
      res.json(yeniToplanti);
    } catch (err) {
      logger.error("Toplantı eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/toplantilar/kararlar
// @desc    Toplantı kararı ekle
// @access  Özel
router.post(
  "/kararlar",
  [
    auth,
    yetkiKontrol("toplantilar_ekleme"),
    [
      check("toplanti_id", "Toplantı ID gereklidir").not().isEmpty(),
      check("kararNo", "Karar numarası gereklidir").not().isEmpty(),
      check("karar", "Karar metni gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { toplanti_id, kararNo, karar, sorumlu, sonTarih, durumu } = req.body;

    try {
      // Toplantı var mı kontrolü
      const toplanti = await Toplanti.findById(toplanti_id);
      if (!toplanti) {
        return res
          .status(404)
          .json({ msg: "Belirtilen toplantı kaydı bulunamadı" });
      }

      // Karar no kontrolü (aynı toplantıda aynı karar no olmamalı)
      const existingKarar = await ToplantiDetay.findOne({
        toplanti_id,
        kararNo,
      });

      if (existingKarar) {
        return res.status(400).json({
          msg: "Bu karar numarası bu toplantı için zaten kullanılmış",
        });
      }

      // Yeni karar kaydı oluştur
      const yeniKarar = new ToplantiDetay({
        toplanti_id,
        kararNo,
        karar,
        sorumlu: sorumlu || null,
        sonTarih: sonTarih || null,
        durumu: durumu || "Beklemede",
      });

      await yeniKarar.save();
      res.json(yeniKarar);
    } catch (err) {
      logger.error("Karar eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/toplantilar/katilimcilar
// @desc    Toplantı katılımcısı ekle
// @access  Özel
router.post(
  "/katilimcilar",
  [
    auth,
    yetkiKontrol("toplantilar_ekleme"),
    [
      check("toplanti_id", "Toplantı ID gereklidir").not().isEmpty(),
      check("kisi_id", "Kişi ID gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { toplanti_id, kisi_id, katilimDurumu, gorev } = req.body;

    try {
      // Toplantı var mı kontrolü
      const toplanti = await Toplanti.findById(toplanti_id);
      if (!toplanti) {
        return res
          .status(404)
          .json({ msg: "Belirtilen toplantı kaydı bulunamadı" });
      }

      // Kişi var mı kontrolü - daha detaylı hata yönetimi ekleyelim
      const kisi = await Kisi.findById(kisi_id);
      if (!kisi) {
        logger.error(`Kişi bulunamadı, ID: ${kisi_id}`);
        return res.status(404).json({
          msg: "Belirtilen kişi bulunamadı",
          detail: `ID: ${kisi_id} olan kişi veritabanında bulunamadı.`,
        });
      }

      // Katılımcı daha önce eklenmiş mi?
      const existingKatilimci = await Katilimci.findOne({
        toplanti_id,
        kisi_id,
      });

      if (existingKatilimci) {
        return res
          .status(400)
          .json({ msg: "Bu kişi zaten toplantıya katılımcı olarak eklenmiş" });
      }

      // Yeni katılımcı kaydı oluştur
      const yeniKatilimci = new Katilimci({
        toplanti_id,
        kisi_id,
        katilimDurumu: katilimDurumu || "Katıldı",
        gorev: gorev || "Üye",
      });

      await yeniKatilimci.save();

      // Kişi bilgileriyle birlikte gönder
      const populatedKatilimci = await Katilimci.findById(
        yeniKatilimci._id
      ).populate("kisi_id", ["ad", "soyad", "email", "rol_id"]);
      res.json(populatedKatilimci);
    } catch (err) {
      logger.error("Katılımcı eklenirken hata", { error: err.message });
      // Hata durumunda daha açıklayıcı mesaj dön
      if (err.kind === "ObjectId") {
        return res.status(404).json({
          msg: "Geçersiz ID formatı",
          detail: "Toplantı ID veya Kişi ID geçersiz formatta.",
        });
      }

      res.status(500).json({
        msg: "Sunucu hatası",
        detail: err.message,
      });
    }
  }
);

// @route   POST api/toplantilar/katilimcilar/bulk
// @desc    Toplu katılımcı ekle
// @access  Özel
router.post(
  "/katilimcilar/bulk",
  auth,
  yetkiKontrol("toplantilar_ekleme"),
  async (req, res) => {
    const { toplanti_id, katilimcilar } = req.body;

    if (
      !toplanti_id ||
      !katilimcilar ||
      !Array.isArray(katilimcilar) ||
      katilimcilar.length === 0
    ) {
      return res
        .status(400)
        .json({ msg: "Toplantı ID ve katılımcı listesi gereklidir" });
    }

    try {
      // Toplantı var mı kontrolü
      const toplanti = await Toplanti.findById(toplanti_id);
      if (!toplanti) {
        return res
          .status(404)
          .json({ msg: "Belirtilen toplantı kaydı bulunamadı" });
      }

      // Mevcut katılımcıları kontrol et
      const mevcutKatilimcilar = await Katilimci.find({ toplanti_id }).select(
        "kisi_id"
      );
      const mevcutKatilimciIds = mevcutKatilimcilar.map((k) =>
        k.kisi_id.toString()
      );

      const eklenenler = [];
      const atlanlar = [];

      // Her bir katılımcı için
      for (const katilimci of katilimcilar) {
        const { kisi_id, katilimDurumu, gorev } = katilimci;

        // Kişi daha önce eklenmiş mi kontrol et
        if (mevcutKatilimciIds.includes(kisi_id.toString())) {
          // Kişiyi atla
          const kisi = await Kisi.findById(kisi_id).select("ad soyad");
          atlanlar.push({
            kisi_id,
            ad: kisi ? `${kisi.ad} ${kisi.soyad}` : "Bilinmeyen Kişi",
            sebep: "Zaten eklenmiş",
          });
          continue;
        }

        // Kişi var mı kontrolü
        const kisi = await Kisi.findById(kisi_id);
        if (!kisi) {
          atlanlar.push({
            kisi_id,
            ad: "Bilinmeyen Kişi",
            sebep: "Kişi bulunamadı",
          });
          continue;
        }

        // Yeni katılımcı oluştur
        const yeniKatilimci = new Katilimci({
          toplanti_id,
          kisi_id,
          katilimDurumu: katilimDurumu || "Katıldı",
          gorev: gorev || "Üye",
        });

        await yeniKatilimci.save();

        // Kişi bilgileriyle birlikte eklenenlere ekle
        const populatedKatilimci = await Katilimci.findById(
          yeniKatilimci._id
        ).populate("kisi_id", ["ad", "soyad", "email", "rol_id"]);

        eklenenler.push(populatedKatilimci);
      }

      res.json({
        success: true,
        eklenenler,
        atlanlar,
        eklenenSayisi: eklenenler.length,
        atlanSayisi: atlanlar.length,
      });
    } catch (err) {
      logger.error("Toplu katılımcı eklenirken hata", { error: err.message });
      res.status(500).json({
        msg: "Sunucu hatası",
        detail: err.message,
      });
    }
  }
);

// @route   PUT api/toplantilar/:id
// @desc    Toplantı kaydını güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("toplantilar_guncelleme"),
  async (req, res) => {
    const {
      toplantiTuru,
      aciklama,
      tarih,
      baslamaSaati,
      bitisSaati,
      oturumNo,
      toplantiYeri,
      gundem,
      isActive,
    } = req.body;

    // Toplantı güncelleme objesi
    const toplantiGuncelleme = {};
    if (toplantiTuru) toplantiGuncelleme.toplantiTuru = toplantiTuru;
    if (aciklama !== undefined) toplantiGuncelleme.aciklama = aciklama;
    if (tarih) toplantiGuncelleme.tarih = tarih;
    if (baslamaSaati) toplantiGuncelleme.baslamaSaati = baslamaSaati;
    if (bitisSaati) toplantiGuncelleme.bitisSaati = bitisSaati;
    if (oturumNo !== undefined) toplantiGuncelleme.oturumNo = oturumNo;
    if (toplantiYeri) toplantiGuncelleme.toplantiYeri = toplantiYeri;
    if (gundem !== undefined) toplantiGuncelleme.gundem = gundem;
    if (isActive !== undefined) toplantiGuncelleme.isActive = isActive;

    try {
      // Toplantı kaydı var mı kontrolü
      let toplanti = await Toplanti.findById(req.params.id);

      if (!toplanti) {
        return res.status(404).json({ msg: "Toplantı kaydı bulunamadı" });
      }

      // Güncelleme yap
      toplanti = await Toplanti.findByIdAndUpdate(
        req.params.id,
        { $set: toplantiGuncelleme },
        { new: true }
      );

      res.json(toplanti);
    } catch (err) {
      logger.error("Toplantı güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Toplantı kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/toplantilar/kararlar/:id
// @desc    Toplantı kararını güncelle
// @access  Özel
router.put(
  "/kararlar/:id",
  auth,
  yetkiKontrol("toplantilar_guncelleme"),
  async (req, res) => {
    const { kararNo, karar, sorumlu, sonTarih, durumu } = req.body;

    // Karar güncelleme objesi
    const kararGuncelleme = {};
    if (kararNo) kararGuncelleme.kararNo = kararNo;
    if (karar) kararGuncelleme.karar = karar;
    if (sorumlu !== undefined) kararGuncelleme.sorumlu = sorumlu;
    if (sonTarih !== undefined) kararGuncelleme.sonTarih = sonTarih;
    if (durumu) kararGuncelleme.durumu = durumu;

    try {
      // Karar kaydı var mı kontrolü
      let kararKaydi = await ToplantiDetay.findById(req.params.id);

      if (!kararKaydi) {
        return res.status(404).json({ msg: "Karar kaydı bulunamadı" });
      }

      // Aynı karar no başka kararda kullanılmış mı?
      if (kararNo && kararNo !== kararKaydi.kararNo) {
        const existingKarar = await ToplantiDetay.findOne({
          toplanti_id: kararKaydi.toplanti_id,
          kararNo,
          _id: { $ne: req.params.id },
        });

        if (existingKarar) {
          return res
            .status(400)
            .json({ msg: "Bu karar numarası zaten kullanılmış" });
        }
      }

      // Güncelleme yap
      kararKaydi = await ToplantiDetay.findByIdAndUpdate(
        req.params.id,
        { $set: kararGuncelleme },
        { new: true }
      );

      res.json(kararKaydi);
    } catch (err) {
      logger.error("Karar güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Karar kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/toplantilar/katilimcilar/:id
// @desc    Katılımcı bilgisini güncelle
// @access  Özel
router.put(
  "/katilimcilar/:id",
  auth,
  yetkiKontrol("toplantilar_guncelleme"),
  async (req, res) => {
    const { katilimDurumu, gorev } = req.body;

    // Katılımcı güncelleme objesi
    const katilimciGuncelleme = {};
    if (katilimDurumu) katilimciGuncelleme.katilimDurumu = katilimDurumu;
    if (gorev) katilimciGuncelleme.gorev = gorev;

    try {
      // Katılımcı kaydı var mı kontrolü
      let katilimci = await Katilimci.findById(req.params.id);

      if (!katilimci) {
        return res.status(404).json({ msg: "Katılımcı kaydı bulunamadı" });
      }

      // Güncelleme yap
      katilimci = await Katilimci.findByIdAndUpdate(
        req.params.id,
        { $set: katilimciGuncelleme },
        { new: true }
      ).populate("kisi_id", ["ad", "soyad", "email", "rol_id"]);

      res.json(katilimci);
    } catch (err) {
      logger.error("Katılımcı güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Katılımcı kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/toplantilar/:id
// @desc    Toplantı kaydını sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("toplantilar_silme"),
  async (req, res) => {
    try {
      // Toplantı kaydı var mı kontrolü
      const toplanti = await Toplanti.findById(req.params.id);

      if (!toplanti) {
        return res.status(404).json({ msg: "Toplantı kaydı bulunamadı" });
      }

      // Önce ilişkili detay/katılımcı kayıtlarını sil
      await ToplantiDetay.deleteMany({ toplanti_id: req.params.id });
      await Katilimci.deleteMany({ toplanti_id: req.params.id });

      // Ardından toplantı kaydını sil
      await toplanti.remove();

      res.json({ msg: "Toplantı kaydı, kararları ve katılımcıları silindi" });
    } catch (err) {
      logger.error("Toplantı silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Toplantı kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/toplantilar/kararlar/:id
// @desc    Karar kaydı sil
// @access  Özel
router.delete(
  "/kararlar/:id",
  auth,
  yetkiKontrol("toplantilar_silme"),
  async (req, res) => {
    try {
      // Karar kaydı var mı kontrolü
      const karar = await ToplantiDetay.findById(req.params.id);

      if (!karar) {
        return res.status(404).json({ msg: "Karar kaydı bulunamadı" });
      }

      // Karar kaydını sil
      await karar.remove();

      res.json({ msg: "Karar kaydı silindi" });
    } catch (err) {
      logger.error("Karar silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Karar kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/toplantilar/katilimcilar/:id
// @desc    Katılımcı kaydı sil
// @access  Özel
router.delete(
  "/katilimcilar/:id",
  auth,
  yetkiKontrol("toplantilar_silme"),
  async (req, res) => {
    try {
      // Katılımcı kaydı var mı kontrolü
      const katilimci = await Katilimci.findById(req.params.id);

      if (!katilimci) {
        return res.status(404).json({ msg: "Katılımcı kaydı bulunamadı" });
      }

      // Katılımcı kaydını sil
      await katilimci.remove();

      res.json({ msg: "Katılımcı kaydı silindi" });
    } catch (err) {
      logger.error("Katılımcı silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Katılımcı kaydı bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/toplantilar/delete-many
// @desc    Çoklu toplantı kaydı silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("toplantilar_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // İlişkili tüm detay ve katılımcı kayıtlarını sil
      await ToplantiDetay.deleteMany({ toplanti_id: { $in: ids } });
      await Katilimci.deleteMany({ toplanti_id: { $in: ids } });

      // Ardından toplantı kayıtlarını sil
      const result = await Toplanti.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ msg: "Silinecek toplantı kaydı bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet toplantı kaydı silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Toplu toplantı silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
