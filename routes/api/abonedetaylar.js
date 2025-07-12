const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");

const AboneDetay = require("../../models/AboneDetay");
const Abone = require("../../models/Abone");
const Ucret = require("../../models/Ucret");

// @route   GET api/abonedetaylar
// @desc    Tüm abone detaylarını getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("abonedetaylar_goruntuleme"),
  async (req, res) => {
    try {
      const aboneDetaylar = await AboneDetay.find()
        .populate("abone_id", "aboneNo aboneTuru")
        .populate({
          path: "abone_id",
          populate: { path: "kisi_id", select: "ad soyad telefonNumarasi" },
        })
        .populate("ucret_id", "ad tutar")
        .populate("okuyankisi_id", "ad soyad")
        .sort({ kayitTarihi: -1 });
      res.json(aboneDetaylar);
    } catch (err) {
      logger.error("Abone detaylar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/abonedetaylar/:id
// @desc    ID'ye göre abone detay kaydı getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("abonedetaylar_goruntuleme"),
  async (req, res) => {
    try {
      const aboneDetay = await AboneDetay.findById(req.params.id)
        .populate("abone_id", "aboneNo aboneTuru")
        .populate({
          path: "abone_id",
          populate: { path: "kisi_id", select: "ad soyad telefonNumarasi" },
        })
        .populate("ucret_id", "ad tutar")
        .populate("okuyankisi_id", "ad soyad");

      if (!aboneDetay) {
        return res.status(404).json({ msg: "Abone detay kaydı bulunamadı" });
      }

      res.json(aboneDetay);
    } catch (err) {
      logger.error("Abone detay getirilirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Abone detay kaydı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/abonedetaylar/abone/:abone_id
// @desc    Aboneye göre abone detaylarını getir
// @access  Özel
router.get(
  "/abone/:abone_id",
  auth,
  yetkiKontrol("abonedetaylar_goruntuleme"),
  async (req, res) => {
    try {
      const aboneDetaylar = await AboneDetay.find({
        abone_id: req.params.abone_id,
      })
        .populate("abone_id", "aboneNo aboneTuru")
        .populate({
          path: "abone_id",
          populate: { path: "kisi_id", select: "ad soyad telefonNumarasi" },
        })
        .populate("ucret_id", "ad tutar")
        .populate("okuyankisi_id", "ad soyad")
        .sort({ yil: -1, ay: -1 });

      res.json(aboneDetaylar);
    } catch (err) {
      logger.error("Aboneye göre detaylar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/abonedetaylar/donem/:yil/:ay
// @desc    Yıl ve aya göre abone detaylarını getir
// @access  Özel
router.get(
  "/donem/:yil/:ay",
  auth,
  yetkiKontrol("abonedetaylar_goruntuleme"),
  async (req, res) => {
    try {
      const { yil, ay } = req.params;
      const aboneDetaylar = await AboneDetay.find({ yil, ay })
        .populate("abone_id", "aboneNo aboneTuru")
        .populate({
          path: "abone_id",
          populate: { path: "kisi_id", select: "ad soyad telefonNumarasi" },
        })
        .populate("ucret_id", "ad tutar")
        .populate("okuyankisi_id", "ad soyad")
        .sort({ kayitTarihi: -1 });

      res.json(aboneDetaylar);
    } catch (err) {
      logger.error("Döneme göre abone detaylar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/abonedetaylar
// @desc    Yeni abone detay kaydı ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("abonedetaylar_ekleme"),
    [
      check("abone_id", "Abone ID gereklidir").not().isEmpty(),
      check("yil", "Yıl gereklidir").not().isEmpty(),
      check("ay", "Ay gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      abone_id,
      yil,
      ay,
      ilkTarih,
      ilkEndeks,
      sonTarih,
      sonEndeks,
      ucret_id,
      birimFiyat,
      okuyankisi_id,
      durumu,
      aciklama,
      odemeDetay,
      isActive,
      okunduMu,
    } = req.body;

    try {
      // Abone var mı kontrolü
      const abone = await Abone.findById(abone_id);
      if (!abone) {
        return res.status(404).json({ msg: "Belirtilen abone bulunamadı" });
      }

      // Aynı abone için aynı dönem kaydı var mı kontrolü
      const existingAboneDetay = await AboneDetay.findOne({
        abone_id,
        yil,
        ay,
      });

      if (existingAboneDetay) {
        return res.status(400).json({
          msg: "Bu abone için belirtilen dönem kaydı zaten mevcut",
        });
      }

      // Tüketim miktarı hesaplama
      let tuketim = 0;
      if (sonEndeks !== undefined && ilkEndeks !== undefined) {
        if (sonEndeks < ilkEndeks) {
          return res.status(400).json({
            msg: "Son endeks değeri ilk endeks değerinden küçük olamaz",
          });
        }
        tuketim = sonEndeks - ilkEndeks;
      }

      // Toplam tutar hesaplama
      let toplamTutar = 0;
      if (tuketim > 0 && birimFiyat > 0) {
        toplamTutar = tuketim * birimFiyat;
      } else if (ucret_id) {
        // Ücret bilgisinden hesaplama yap
        const ucret = await Ucret.findById(ucret_id);
        if (ucret) {
          const hesaplananBirimFiyat = ucret.tutar || 0;
          toplamTutar = tuketim * hesaplananBirimFiyat;

          // Birim fiyat güncelleme
          if (!birimFiyat) {
            birimFiyat = hesaplananBirimFiyat;
          }
        }
      }

      const yeniAboneDetay = new AboneDetay({
        abone_id,
        yil,
        ay,
        ilkTarih,
        ilkEndeks: ilkEndeks || 0,
        sonTarih,
        sonEndeks,
        tuketim,
        ucret_id,
        birimFiyat: birimFiyat || 0,
        toplamTutar,
        okuyankisi_id,
        durumu: durumu || "Okunmadı",
        aciklama,
        odemeDetay,
        isActive: isActive !== undefined ? isActive : true,
        okunduMu: okunduMu || false,
      });

      await yeniAboneDetay.save();

      // Kaydedilen detayı ilişkili verilerle birlikte döndür
      const populatedAboneDetay = await AboneDetay.findById(yeniAboneDetay._id)
        .populate("abone_id", "aboneNo aboneTuru")
        .populate({
          path: "abone_id",
          populate: { path: "kisi_id", select: "ad soyad telefonNumarasi" },
        })
        .populate("ucret_id", "ad tutar")
        .populate("okuyankisi_id", "ad soyad");

      res.json(populatedAboneDetay);
    } catch (err) {
      logger.error("Yeni abone detay eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/abonedetaylar/bulk
// @desc    Toplu abone detay kaydı ekle
// @access  Özel
router.post(
  "/bulk",
  auth,
  yetkiKontrol("abonedetaylar_ekleme"),
  async (req, res) => {
    try {
      const { detaylar } = req.body;

      if (!Array.isArray(detaylar) || detaylar.length === 0) {
        return res
          .status(400)
          .json({ msg: "Geçerli detay listesi sağlanmadı" });
      }

      const basariliKayitlar = [];
      const hataliKayitlar = [];

      // Her detay için işlem yap
      for (const detay of detaylar) {
        try {
          const {
            abone_id,
            yil,
            ay,
            ilkTarih,
            ilkEndeks,
            sonTarih,
            sonEndeks,
            ucret_id,
            birimFiyat,
            okuyankisi_id,
            durumu,
            aciklama,
          } = detay;

          // Abone var mı kontrolü
          const abone = await Abone.findById(abone_id);
          if (!abone) {
            hataliKayitlar.push({
              ...detay,
              hata: "Belirtilen abone bulunamadı",
            });
            continue;
          }

          // Aynı abone için aynı dönem kaydı var mı kontrolü
          const existingAboneDetay = await AboneDetay.findOne({
            abone_id,
            yil,
            ay,
          });

          if (existingAboneDetay) {
            hataliKayitlar.push({
              ...detay,
              hata: "Bu abone için belirtilen dönem kaydı zaten mevcut",
            });
            continue;
          }

          // Tüketim miktarı hesaplama
          let tuketim = 0;
          if (sonEndeks !== undefined && ilkEndeks !== undefined) {
            if (sonEndeks < ilkEndeks) {
              hataliKayitlar.push({
                ...detay,
                hata: "Son endeks değeri ilk endeks değerinden küçük olamaz",
              });
              continue;
            }
            tuketim = sonEndeks - ilkEndeks;
          }

          // Toplam tutar hesaplama
          let toplamTutar = 0;
          let hesaplananBirimFiyat = birimFiyat || 0;

          if (ucret_id) {
            // Ücret bilgisinden hesaplama yap
            const ucret = await Ucret.findById(ucret_id);
            if (ucret) {
              hesaplananBirimFiyat = ucret.tutar || birimFiyat || 0;
            }
          }

          if (tuketim > 0) {
            toplamTutar = tuketim * hesaplananBirimFiyat;
          }

          const yeniAboneDetay = new AboneDetay({
            abone_id,
            yil,
            ay,
            ilkTarih,
            ilkEndeks: ilkEndeks || 0,
            sonTarih,
            sonEndeks,
            tuketim,
            ucret_id,
            birimFiyat: hesaplananBirimFiyat,
            toplamTutar,
            okuyankisi_id,
            durumu: durumu || "Okunmadı",
            aciklama,
          });

          await yeniAboneDetay.save();
          basariliKayitlar.push(yeniAboneDetay);
        } catch (err) {
          logger.error("Toplu abone detay eklenirken kayıt hatası", {
            error: err.message,
          });
          hataliKayitlar.push({
            ...detay,
            hata: err.message,
          });
        }
      }

      res.json({
        basariliKayitSayisi: basariliKayitlar.length,
        hataliKayitSayisi: hataliKayitlar.length,
        basariliKayitlar,
        hataliKayitlar,
      });
    } catch (err) {
      logger.error("Toplu abone detay eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/abonedetaylar/:id
// @desc    Abone detay kaydını güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("abonedetaylar_guncelleme"),
  async (req, res) => {
    const {
      ilkTarih,
      ilkEndeks,
      sonTarih,
      sonEndeks,
      ucret_id,
      birimFiyat,
      okuyankisi_id,
      durumu,
      aciklama,
      odemeDetay,
      isActive,
      okunduMu,
    } = req.body;

    // AboneDetay güncelleme objesi
    const aboneDetayGuncelleme = {};
    if (ilkTarih !== undefined) aboneDetayGuncelleme.ilkTarih = ilkTarih;
    if (ilkEndeks !== undefined) aboneDetayGuncelleme.ilkEndeks = ilkEndeks;
    if (sonTarih !== undefined) aboneDetayGuncelleme.sonTarih = sonTarih;
    if (sonEndeks !== undefined) aboneDetayGuncelleme.sonEndeks = sonEndeks;
    if (ucret_id !== undefined) aboneDetayGuncelleme.ucret_id = ucret_id;
    if (birimFiyat !== undefined) aboneDetayGuncelleme.birimFiyat = birimFiyat;
    if (okuyankisi_id !== undefined)
      aboneDetayGuncelleme.okuyankisi_id = okuyankisi_id;
    if (durumu !== undefined) aboneDetayGuncelleme.durumu = durumu;
    if (aciklama !== undefined) aboneDetayGuncelleme.aciklama = aciklama;
    if (odemeDetay !== undefined) aboneDetayGuncelleme.odemeDetay = odemeDetay;
    if (isActive !== undefined) aboneDetayGuncelleme.isActive = isActive;
    if (okunduMu !== undefined) aboneDetayGuncelleme.okunduMu = okunduMu;

    try {
      // AboneDetay var mı kontrolü
      let aboneDetay = await AboneDetay.findById(req.params.id);

      if (!aboneDetay) {
        return res.status(404).json({ msg: "Abone detay kaydı bulunamadı" });
      }

      // Tüketim ve toplam tutar hesaplama
      let ilkEndeksDegeri =
        ilkEndeks !== undefined ? ilkEndeks : aboneDetay.ilkEndeks || 0;
      let sonEndeksDegeri =
        sonEndeks !== undefined ? sonEndeks : aboneDetay.sonEndeks;

      if (sonEndeksDegeri !== undefined && ilkEndeksDegeri !== undefined) {
        if (sonEndeksDegeri < ilkEndeksDegeri) {
          return res.status(400).json({
            msg: "Son endeks değeri ilk endeks değerinden küçük olamaz",
          });
        }

        aboneDetayGuncelleme.tuketim = sonEndeksDegeri - ilkEndeksDegeri;

        // Birim fiyatı belirle
        let birimFiyatDegeri = birimFiyat;
        if (birimFiyat === undefined) {
          birimFiyatDegeri = aboneDetay.birimFiyat;

          // Eğer ücret ID değişmişse yeni birim fiyatı al
          if (ucret_id && ucret_id !== aboneDetay.ucret_id?.toString()) {
            const ucret = await Ucret.findById(ucret_id);
            if (ucret) {
              birimFiyatDegeri = ucret.tutar;
              aboneDetayGuncelleme.birimFiyat = birimFiyatDegeri;
            }
          }
        }

        // Toplam tutar hesapla
        aboneDetayGuncelleme.toplamTutar =
          aboneDetayGuncelleme.tuketim * birimFiyatDegeri;
      }

      // Güncelleme yap
      aboneDetay = await AboneDetay.findByIdAndUpdate(
        req.params.id,
        { $set: aboneDetayGuncelleme },
        { new: true }
      )
        .populate("abone_id", "aboneNo aboneTuru")
        .populate({
          path: "abone_id",
          populate: { path: "kisi_id", select: "ad soyad telefonNumarasi" },
        })
        .populate("ucret_id", "ad tutar")
        .populate("okuyankisi_id", "ad soyad");

      res.json(aboneDetay);
    } catch (err) {
      logger.error("Abone detay güncellenirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Abone detay kaydı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/abonedetaylar/:id
// @desc    Abone detay kaydı sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("abonedetaylar_silme"),
  async (req, res) => {
    try {
      const aboneDetay = await AboneDetay.findById(req.params.id);

      if (!aboneDetay) {
        return res.status(404).json({ msg: "Abone detay kaydı bulunamadı" });
      }

      await aboneDetay.remove();
      res.json({ msg: "Abone detay kaydı silindi" });
    } catch (err) {
      logger.error("Abone detay silinirken hata", { error: err.message });
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Abone detay kaydı bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/abonedetaylar/delete-many
// @desc    Çoklu abone detay kaydı silme
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("abonedetaylar_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      const result = await AboneDetay.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ msg: "Silinecek abone detay kaydı bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet abone detay kaydı silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Çoklu abone detay silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
