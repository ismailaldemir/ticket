const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Ucret = require("../../models/Ucret");
const Borc = require("../../models/Borc");
const Tarife = require("../../models/Tarife");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

// @route   GET api/ucretler
// @desc    Tüm ücretleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("ucretler_goruntuleme"),
  async (req, res) => {
    try {
      const ucretler = await Ucret.find().sort({ kayitTarihi: -1 });
      res.json(ucretler);
    } catch (err) {
      logger.error("Ücretler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/ucretler/active
// @desc    Aktif ücretleri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("ucretler_goruntuleme"),
  async (req, res) => {
    try {
      const ucretler = await Ucret.find({ isActive: true })
        .populate("tarife_id", ["ad", "kod"])
        .sort({ ad: 1 });
      res.json(ucretler);
    } catch (err) {
      logger.error("Aktif ücretler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/ucretler/gecerli
// @desc    Geçerli ücretleri getir (bitiş tarihi null olan veya bugünden sonra olanlar)
// @access  Özel
router.get(
  "/gecerli",
  auth,
  yetkiKontrol("ucretler_goruntuleme"),
  async (req, res) => {
    try {
      const bugun = new Date();

      const ucretler = await Ucret.find({
        $and: [
          { isActive: true },
          {
            $or: [{ bitisTarihi: null }, { bitisTarihi: { $gt: bugun } }],
          },
        ],
      }).sort({ baslangicTarihi: -1 });

      const filtreliUcretler = [];
      const ucretMap = new Map();

      ucretler.forEach((ucret) => {
        if (!ucret.bitisTarihi) {
          const ucretAdi = ucret.ad;

          if (ucretMap.has(ucretAdi)) {
            const oncekiUcret = ucretMap.get(ucretAdi);

            if (
              new Date(ucret.baslangicTarihi) >
              new Date(oncekiUcret.baslangicTarihi)
            ) {
              ucretMap.set(ucretAdi, ucret);
            }
          } else {
            ucretMap.set(ucretAdi, ucret);
          }
        } else {
          filtreliUcretler.push(ucret);
        }
      });

      ucretMap.forEach((ucret) => {
        filtreliUcretler.push(ucret);
      });

      res.json(filtreliUcretler);
    } catch (err) {
      logger.error("Geçerli ücretler getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/ucretler/:id
// @desc    ID'ye göre ücret getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("ucretler_goruntuleme"),
  async (req, res) => {
    try {
      const ucret = await Ucret.findById(req.params.id);

      if (!ucret) {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      res.json(ucret);
    } catch (err) {
      logger.error("Ücret getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/ucretler/tarife/:tarife_id
// @desc    Bir tarifeye ait ücretleri getir
// @access  Özel
router.get(
  "/tarife/:tarife_id",
  auth,
  yetkiKontrol("ucretler_goruntuleme"),
  async (req, res) => {
    try {
      const ucretler = await Ucret.find({
        tarife_id: req.params.tarife_id,
      }).sort({
        baslangicTarihi: -1,
      });

      res.json(ucretler);
    } catch (err) {
      logger.error("Tarifeye ait ücretler getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/ucretler/kullanim-alani/:alan
// @desc    Belirli bir alanda (gelirler, giderler vs.) kullanılabilecek tarifeleri getir
// @access  Özel
router.get(
  "/kullanim-alani/:alan",
  auth,
  yetkiKontrol("ucretler_goruntuleme"),
  async (req, res) => {
    try {
      const alan = req.params.alan;

      const alanFilter = {};
      alanFilter[`kullanilabilecekAlanlar.${alan}`] = true;

      const tarifeler = await Tarife.find({
        ...alanFilter,
        isActive: true,
      });

      const tarifeIds = tarifeler.map((t) => t._id);

      const ucretler = await Ucret.find({
        tarife_id: { $in: tarifeIds },
        isActive: true,
      }).populate("tarife_id", ["ad", "kod"]);

      res.json(ucretler);
    } catch (err) {
      logger.error("Kullanım alanına ait ücretler getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/ucretler
// @desc    Yeni ücret ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("ucretler_ekleme"),
    [
      check("tutar", "Tutar gereklidir").isNumeric(),
      check("baslangicTarihi", "Başlangıç tarihi gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      tutar,
      aciklama,
      birimUcret,
      aylıkUcret,
      tarife_id,
      baslangicTarihi,
      bitisTarihi,
      isActive,
    } = req.body;

    try {
      if (tarife_id) {
        const tarife = await Tarife.findById(tarife_id);
        if (!tarife) {
          return res.status(404).json({ msg: "Belirtilen tarife bulunamadı" });
        }
      }

      const ucret = new Ucret({
        tutar,
        aciklama,
        birimUcret: birimUcret !== undefined ? birimUcret : false,
        aylıkUcret: aylıkUcret !== undefined ? aylıkUcret : false,
        tarife_id,
        baslangicTarihi,
        bitisTarihi: bitisTarihi || null,
        isActive: isActive !== undefined ? isActive : true,
      });

      await ucret.save();
      res.json(ucret);
    } catch (err) {
      logger.error("Ücret eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/ucretler/:id
// @desc    Ücret bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("ucretler_guncelleme"),
  async (req, res) => {
    const {
      tutar,
      aciklama,
      birimUcret,
      aylıkUcret,
      tarife_id,
      baslangicTarihi,
      bitisTarihi,
      isActive,
    } = req.body;

    const ucretGuncelleme = {};
    if (tutar !== undefined) ucretGuncelleme.tutar = tutar;
    if (aciklama !== undefined) ucretGuncelleme.aciklama = aciklama;
    if (birimUcret !== undefined) ucretGuncelleme.birimUcret = birimUcret;
    if (aylıkUcret !== undefined) ucretGuncelleme.aylıkUcret = aylıkUcret;
    if (tarife_id) ucretGuncelleme.tarife_id = tarife_id;
    if (baslangicTarihi) ucretGuncelleme.baslangicTarihi = baslangicTarihi;
    if (bitisTarihi !== undefined)
      ucretGuncelleme.bitisTarihi = bitisTarihi || null;
    if (isActive !== undefined) ucretGuncelleme.isActive = isActive;

    try {
      let ucret = await Ucret.findById(req.params.id);

      if (!ucret) {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      if (tarife_id) {
        const tarife = await Tarife.findById(tarife_id);
        if (!tarife) {
          return res.status(404).json({ msg: "Belirtilen tarife bulunamadı" });
        }
      }

      if (
        (tutar && tutar !== ucret.tutar) ||
        (birimUcret !== undefined && birimUcret !== ucret.birimUcret) ||
        (aylıkUcret !== undefined && aylıkUcret !== ucret.aylıkUcret)
      ) {
        const borcSayisi = await Borc.countDocuments({
          ucret_id: req.params.id,
        });

        if (borcSayisi > 0) {
          logger.warn(
            `Ücret güncellendi ancak bu ücretle ilişkili ${borcSayisi} adet borç bulunmaktadır.`
          );
        }
      }

      ucret = await Ucret.findByIdAndUpdate(
        req.params.id,
        { $set: ucretGuncelleme },
        { new: true }
      );

      res.json(ucret);
    } catch (err) {
      logger.error("Ücret güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/ucretler/:id
// @desc    Ücret sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("ucretler_silme"),
  async (req, res) => {
    try {
      const ucret = await Ucret.findById(req.params.id);

      if (!ucret) {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      const borc = await Borc.findOne({ ucret_id: req.params.id });
      if (borc) {
        return res.status(400).json({
          msg: "Bu ücrete ait borçlar olduğu için silinemez. Önce ilgili borçları siliniz.",
        });
      }

      await ucret.remove();
      res.json({ msg: "Ücret silindi" });
    } catch (err) {
      logger.error("Ücret silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Ücret bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/ucretler
// @desc    Çoklu ücret silme
// @access  Özel
router.delete("/", auth, yetkiKontrol("ucretler_silme"), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ msg: "Silinecek ücretler belirtilmedi" });
    }

    for (const id of ids) {
      const borc = await Borc.findOne({ ucret_id: id });
      if (borc) {
        const ucret = await Ucret.findById(id);
        return res.status(400).json({
          msg: `${
            ucret ? ucret.ad : "Seçilen ücret"
          } ücretine ait borçlar olduğu için silme işlemi yapılamadı. Önce ilgili borçları siliniz.`,
        });
      }
    }

    await Ucret.deleteMany({ _id: { $in: ids } });

    res.json({ msg: "Ücretler başarıyla silindi", deletedIds: ids });
  } catch (err) {
    logger.error("Çoklu ücret silinirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;
