const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");
const { check, validationResult } = require("express-validator");

const Borc = require("../../models/Borc");
const Kisi = require("../../models/Kisi");
const Ucret = require("../../models/Ucret");
const Odeme = require("../../models/Odeme");

// @route   GET api/borclar
// @desc    Tüm borçları getir
// @access  Özel
router.get("/", auth, yetkiKontrol("borclar_goruntuleme"), async (req, res) => {
  try {
    const borclar = await Borc.find()
      .populate("kisi_id", ["ad", "soyad"])
      .populate({
        path: "ucret_id",
        select: ["ad", "tutar", "birimUcret"],
        populate: {
          path: "tarife_id",
          select: ["ad", "kod"],
        },
      })
      .sort({ yil: -1, ay: -1 });
    res.json(borclar);
  } catch (err) {
    logger.error("Borçlar getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/borclar/:id
// @desc    ID'ye göre borç getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const borc = await Borc.findById(req.params.id)
        .populate("kisi_id", ["ad", "soyad"])
        .populate("ucret_id", ["tutar", "baslangicTarihi", "bitisTarihi"]);

      if (!borc) {
        return res.status(404).json({ msg: "Borç bulunamadı" });
      }

      res.json(borc);
    } catch (err) {
      logger.error("Borç getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Borç bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// Aynı kişi için aynı ay ve yıla ait borç olup olmadığını kontrol eden yardımcı fonksiyon
const borcVarmi = async (kisi_id, yil, ay, borc_id = null) => {
  const query = { kisi_id, yil, ay };

  // Eğer borc_id verilmişse (güncelleme durumu), kendisi hariç kontrol et
  if (borc_id) {
    query._id = { $ne: borc_id };
  }

  const existingBorc = await Borc.findOne(query);
  return existingBorc;
};

// @route   POST api/borclar
// @desc    Yeni borç ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("borclar_ekleme"),
    [
      check("kisi_id", "Kişi ID gereklidir").not().isEmpty(),
      check("ucret_id", "Ücret ID gereklidir").not().isEmpty(),
      check("borcTutari", "Borç tutarı gereklidir").isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      kisi_id,
      ucret_id,
      borclandirmaTarihi,
      borcTutari,
      miktar,
      aciklama,
      yil,
      ay,
      sonOdemeTarihi,
    } = req.body;

    try {
      // Kişi ve ücret var mı kontrolü
      const kisi = await Kisi.findById(kisi_id);
      if (!kisi) {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      const ucret = await Ucret.findById(ucret_id);
      if (!ucret) {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      // Aynı kişi için aynı ay ve yıla ait borç kontrolü
      if (yil && ay) {
        const existingBorc = await borcVarmi(kisi_id, yil, ay);
        if (existingBorc) {
          return res.status(400).json({
            msg: `${kisi.ad} ${kisi.soyad} için ${ay}. ay ${yil} dönemine ait borç kaydı zaten mevcut`,
          });
        }
      }

      // Yeni borç oluştur
      const yeniBorc = new Borc({
        kisi_id,
        ucret_id,
        yil,
        ay,
        borclandirmaTarihi: borclandirmaTarihi || Date.now(),
        borcTutari,
        miktar: miktar || 1, // Miktar alanını ekle
        aciklama,
        kalan: borcTutari, // İlk oluşturmada kalan tutar borç tutarının aynısıdır
        sonOdemeTarihi: sonOdemeTarihi || undefined,
      });

      await yeniBorc.save();

      // İlişkileri yükleyerek cevap ver
      const populatedBorc = await Borc.findById(yeniBorc._id)
        .populate("kisi_id", ["ad", "soyad"])
        .populate("ucret_id", ["ad", "tutar", "birimUcret"]);

      res.json(populatedBorc);
    } catch (err) {
      logger.error("Borç eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/borclar/bulk
// @desc    Toplu borç ekle
// @access  Private
router.post("/bulk", auth, yetkiKontrol("borclar_ekleme"), async (req, res) => {
  try {
    const { borclar } = req.body;

    if (!Array.isArray(borclar) || borclar.length === 0) {
      return res.status(400).json({ msg: "Geçerli borç verisi gönderilmedi" });
    }

    // Toplu borç eklemeden önce mevcut borçları kontrol et
    const gecerliBorclar = [];
    const atlacilanBorclar = [];

    // Bütün borçları tek tek kontrol et
    for (const borc of borclar) {
      const { kisi_id, yil, ay } = borc;

      // Aynı kişi için aynı ay ve yıla ait borç var mı kontrol et
      const existingBorc = await borcVarmi(kisi_id, yil, ay);

      if (existingBorc) {
        // Kişi bilgilerini al
        const kisi = await Kisi.findById(kisi_id);
        atlacilanBorclar.push({
          kisi: kisi ? `${kisi.ad} ${kisi.soyad}` : "Bilinmeyen Kişi",
          yil,
          ay,
        });
      } else {
        // Son ödeme tarihi eklendi
        if (!borc.sonOdemeTarihi) {
          borc.sonOdemeTarihi = undefined;
        }
        gecerliBorclar.push(borc);
      }
    }

    // Eğer hiç geçerli borç yoksa işlemi durdur
    if (gecerliBorclar.length === 0) {
      return res.status(400).json({
        msg: "Tüm borçlar zaten mevcut, hiçbir kayıt eklenmedi",
        atlacilanBorclar,
      });
    }

    // Geçerli borçları oluştur
    const createdBorclar = await Borc.insertMany(gecerliBorclar);

    // Populate işlemi
    await Borc.populate(createdBorclar, [
      { path: "kisi_id", select: "ad soyad" },
      { path: "ucret_id", select: "ad tutar" },
    ]);

    // Sonuçları döndür
    res.json({
      eklenenBorclar: createdBorclar,
      atlacilanBorcSayisi: atlacilanBorclar.length,
      atlacilanBorclar,
    });
  } catch (err) {
    logger.error("Toplu borç eklenirken hata", { error: err.message });
    res.status(500).json({ msg: "Sunucu hatası: " + err.message });
  }
});

// @route   POST api/borclar/toplu-olustur
// @desc    Toplu borç oluştur
// @access  Özel
router.post(
  "/toplu-olustur",
  auth,
  yetkiKontrol("borclar_ekleme"),
  async (req, res) => {
    const { ucret_id, yil, ay, uyeler, sonOdemeTarihi, aciklama } = req.body;

    try {
      // Ücret kontrolü
      const ucret = await Ucret.findById(ucret_id);
      if (!ucret) {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      // Sonuçları saklamak için değişkenler
      const olusturulanBorclar = [];
      const hatalar = [];

      // Eğer belirli üyeler belirtilmişse onları işle, yoksa tüm aktif üyeleri getir
      let islenecekUyeler = [];

      if (uyeler && uyeler.length > 0) {
        islenecekUyeler = await Uye.find({
          _id: { $in: uyeler },
          isActive: true,
        }).populate("uyeRol_id");
      } else {
        islenecekUyeler = await Uye.find({ isActive: true }).populate(
          "uyeRol_id"
        );
      }

      // Her üye için işlem yap
      for (const uye of islenecekUyeler) {
        try {
          // ÖNEMLİ: EKLENEN YENİ KONTROL - Eğer ücret aylık ücret ise ve üye rolü aylık ücretten muaf ise, bu üye için borç oluşturma
          if (
            ucret.aylıkUcret &&
            uye.uyeRol_id &&
            uye.uyeRol_id.aylıkUcrettenMuaf
          ) {
            continue; // Bu üyeyi atla
          }

          // Aynı ay ve yıl için zaten borç var mı kontrol et
          const mevcutBorc = await Borc.findOne({
            kisi_id: uye.kisi_id,
            yil,
            ay,
            ucret_id: ucret_id,
          });

          if (mevcutBorc) {
            hatalar.push({
              uye_id: uye._id,
              kisi_id: uye.kisi_id,
              hata: "Bu ay için zaten borç kaydı mevcut",
            });
            continue;
          }

          // Yeni borç oluştur
          const yeniBorc = new Borc({
            kisi_id: uye.kisi_id,
            ucret_id: ucret_id,
            yil,
            ay,
            borcTutari: ucret.tutar,
            kalan: ucret.tutar,
            sonOdemeTarihi: sonOdemeTarihi || undefined,
            aciklama: aciklama || `${ay}/${yil} - ${ucret.ad}`,
            odendi: false,
          });

          await yeniBorc.save();
          olusturulanBorclar.push(yeniBorc);
        } catch (err) {
          logger.error(`Üye (${uye._id}) için borç oluşturma hatası:`, {
            error: err.message,
          });
          hatalar.push({
            uye_id: uye._id,
            kisi_id: uye.kisi_id,
            hata: "Borç oluşturma işlemi başarısız",
          });
        }
      }

      res.json({
        basarili: olusturulanBorclar.length,
        hatalar: hatalar.length,
        hataliKayitlar: hatalar,
        message: `${olusturulanBorclar.length} borç kaydı oluşturuldu, ${hatalar.length} işlem başarısız oldu.`,
      });
    } catch (err) {
      logger.error("Toplu borç oluşturulurken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/borclar/:id
// @desc    Borç bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("borclar_guncelleme"),
  async (req, res) => {
    const {
      borclandirmaTarihi,
      borcTutari,
      miktar,
      aciklama,
      odendi,
      yil,
      ay,
      sonOdemeTarihi,
    } = req.body;

    // Borç güncelleme objesi
    const borcGuncelleme = {};
    if (borclandirmaTarihi)
      borcGuncelleme.borclandirmaTarihi = borclandirmaTarihi;
    if (borcTutari !== undefined) borcGuncelleme.borcTutari = borcTutari;
    if (miktar !== undefined) borcGuncelleme.miktar = miktar; // Miktar alanını güncelleme
    if (aciklama !== undefined) borcGuncelleme.aciklama = aciklama;
    if (odendi !== undefined) borcGuncelleme.odendi = odendi;
    if (yil) borcGuncelleme.yil = yil;
    if (ay) borcGuncelleme.ay = ay;
    if (sonOdemeTarihi !== undefined)
      borcGuncelleme.sonOdemeTarihi = sonOdemeTarihi;

    try {
      // Borç var mı kontrolü
      let borc = await Borc.findById(req.params.id);

      if (!borc) {
        return res.status(404).json({ msg: "Borç bulunamadı" });
      }

      // Eğer ay veya yıl değişiyorsa, çakışma kontrolü yap
      if ((yil && yil !== borc.yil) || (ay && ay !== borc.ay)) {
        const existingBorc = await borcVarmi(
          borc.kisi_id,
          yil || borc.yil,
          ay || borc.ay,
          req.params.id
        );

        if (existingBorc) {
          const kisi = await Kisi.findById(borc.kisi_id);
          return res.status(400).json({
            msg: `${kisi ? kisi.ad + " " + kisi.soyad : "Kişi"} için ${
              ay || borc.ay
            }. ay ${yil || borc.yil} dönemine ait borç kaydı zaten mevcut`,
          });
        }
      }

      // Borç tutarı değişmişse kalan tutarı güncelle
      if (borcTutari !== undefined) {
        // Mevcut ödemeleri hesapla
        const odemeler = await Odeme.find({ borc_id: req.params.id });
        const odenenTutar = odemeler.reduce(
          (total, odeme) => total + odeme.odemeTutari,
          0
        );

        borcGuncelleme.kalan = borcTutari - odenenTutar;

        // Eğer ödemeler borç tutarından fazla ise hata ver
        if (odenenTutar > borcTutari) {
          return res.status(400).json({
            msg: "Borç tutarı ödemelerden az olamaz",
            odenenTutar,
          });
        }

        // Eğer kalan yoksa borç ödenmiştir
        borcGuncelleme.odendi = borcGuncelleme.kalan <= 0;
      }

      // Borcu güncelle
      borc = await Borc.findByIdAndUpdate(
        req.params.id,
        { $set: borcGuncelleme },
        { new: true }
      )
        .populate("kisi_id", ["ad", "soyad"])
        .populate("ucret_id", ["ad", "tutar", "birimUcret"]);

      res.json(borc);
    } catch (err) {
      logger.error("Borç güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Borç bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/borclar/:id
// @desc    Borç sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("borclar_silme"), async (req, res) => {
  try {
    // Borç var mı kontrolü
    const borc = await Borc.findById(req.params.id);

    if (!borc) {
      return res.status(404).json({ msg: "Borç bulunamadı" });
    }

    // Bu borca ait ödemeler var mı?
    const odeme = await Odeme.findOne({ borc_id: req.params.id });

    if (odeme) {
      return res.status(400).json({
        msg: "Bu borç silinemiyor, çünkü buna ait ödemeler var. Önce ödemeleri siliniz.",
      });
    }

    // Borcu sil
    await borc.remove();
    res.json({ msg: "Borç silindi" });
  } catch (err) {
    logger.error("Borç silinirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Borç bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/borclar/kisi/:kisi_id
// @desc    Kişiye göre borçları getir
// @access  Özel
router.get(
  "/kisi/:kisi_id",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const borclar = await Borc.find({ kisi_id: req.params.kisi_id })
        .populate("ucret_id", ["tutar", "baslangicTarihi", "bitisTarihi"])
        .sort({ borclandirmaTarihi: -1 });

      res.json(borclar);
    } catch (err) {
      logger.error("Kişiye göre borçlar getirilirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/borclar/durum/odenmemis
// @desc    Ödenmemiş borçları getir
// @access  Özel
router.get(
  "/durum/odenmemis",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const borclar = await Borc.find({ odendi: false })
        .populate("kisi_id", ["ad", "soyad"])
        .populate("ucret_id", ["tutar", "baslangicTarihi", "bitisTarihi"])
        .sort({ borclandirmaTarihi: 1 });

      res.json(borclar);
    } catch (err) {
      logger.error("Ödenmemiş borçlar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/borclar/donem-kontrol/:kisiId/:yil/:ay
// @desc    Belirli bir dönemde kişinin borcunun olup olmadığını kontrol et
// @access  Özel
router.get(
  "/donem-kontrol/:kisiId/:yil/:ay",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const { kisiId, yil, ay } = req.params;

      const existingBorc = await borcVarmi(kisiId, Number(yil), Number(ay));

      res.json({
        borcVar: !!existingBorc,
        borc: existingBorc,
      });
    } catch (err) {
      logger.error("Dönem kontrolü yapılırken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/borclar/kisi-odenmemis/:kisi_id
// @desc    Kişiye göre ödenmemiş borçları getir
// @access  Özel
router.get(
  "/kisi-odenmemis/:kisi_id",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const borclar = await Borc.find({
        kisi_id: req.params.kisi_id,
        odendi: false,
      })
        .populate("kisi_id", ["ad", "soyad"])
        .populate({
          path: "ucret_id",
          select: ["ad", "tutar", "birimUcret"],
          populate: {
            path: "tarife_id",
            select: ["ad", "kod"],
          },
        })
        .sort({ yil: -1, ay: -1 });

      res.json(borclar);
    } catch (err) {
      logger.error("Kişiye göre ödenmemiş borçlar getirilirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/borclar/coklu-kisi-odenmemis
// @desc    Birden fazla kişiye ait ödenmemiş borçları getir
// @access  Özel
router.post(
  "/coklu-kisi-odenmemis",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const { kisiIds } = req.body;

      if (!Array.isArray(kisiIds) || kisiIds.length === 0) {
        return res
          .status(400)
          .json({ msg: "En az bir kişi ID'si gönderilmelidir" });
      }

      const borclar = await Borc.find({
        kisi_id: { $in: kisiIds },
        odendi: false,
      })
        .populate("kisi_id", ["ad", "soyad"])
        .populate({
          path: "ucret_id",
          select: ["ad", "tutar", "birimUcret"],
          populate: {
            path: "tarife_id",
            select: ["ad", "kod"],
          },
        })
        .sort({ kisi_id: 1, yil: -1, ay: -1 });

      res.json(borclar);
    } catch (err) {
      logger.error(
        "Birden fazla kişiye ait ödenmemiş borçlar getirilirken hata",
        { error: err.message }
      );
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/borclar/odenmemis/coklu
// @desc    Çoklu kişilere ait ödenmemiş borçları getir
// @access  Özel
router.post(
  "/odenmemis/coklu",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const { kisi_ids } = req.body;

      if (!Array.isArray(kisi_ids) || kisi_ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Geçerli kişi ID listesi gönderilmedi" });
      }

      const borclar = await Borc.find({
        kisi_id: { $in: kisi_ids },
        odendi: false,
      })
        .populate("kisi_id", ["ad", "soyad"])
        .populate({
          path: "ucret_id",
          select: ["ad", "tutar", "birimUcret"],
          populate: {
            path: "tarife_id",
            select: ["ad", "kod"],
          },
        })
        .sort({ kisi_id: 1, yil: -1, ay: -1 });

      res.json(borclar);
    } catch (err) {
      logger.error("Çoklu kişilere ait ödenmemiş borçlar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/borclar/kisi/:kisi_id/odenmemis
// @desc    Kişiye ait ödenmemiş borçları getir
// @access  Özel
router.get(
  "/kisi/:kisi_id/odenmemis",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const borclar = await Borc.find({
        kisi_id: req.params.kisi_id,
        odendi: false,
      })
        .populate("kisi_id", ["ad", "soyad"])
        .populate("ucret_id", ["ad", "tutar", "birimUcret"])
        .sort({ borclandirmaTarihi: -1 });

      res.json(borclar);
    } catch (err) {
      logger.error("Kişiye ait ödenmemiş borçlar getirilirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/borclar/kisi/:kisi_id
// @desc    Kişiye ait tüm borçları getir (ödenen ve ödenmeyenler)
// @access  Özel
router.get(
  "/kisi/:kisi_id",
  auth,
  yetkiKontrol("borclar_goruntuleme"),
  async (req, res) => {
    try {
      const borclar = await Borc.find({
        kisi_id: req.params.kisi_id,
      })
        .populate("kisi_id", ["ad", "soyad"])
        .populate("ucret_id", ["ad", "tutar", "birimUcret"])
        .sort({ borclandirmaTarihi: -1 });

      res.json(borclar);
    } catch (err) {
      logger.error("Kişiye ait tüm borçlar getirilirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kişi bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
