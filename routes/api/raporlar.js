const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");
const Kisi = require("../../models/Kisi");
const Borc = require("../../models/Borc");
const Odeme = require("../../models/Odeme");

// @route   POST api/raporlar/aylik-borc-raporu
// @desc    Aylık borç raporu oluştur
// @access  Özel
router.post(
  "/aylik-borc-raporu",
  auth,
  yetkiKontrol("raporlar_goruntuleme"),
  async (req, res) => {
    try {
      logger.info("Gelen filtreler:", req.body); // Debug için filtreleri loglayalım

      const { baslangicTarihi, bitisTarihi, kisiId, grupId, odemeDurumu } =
        req.body;

      // Tarih aralığı kontrolü
      const startDate = new Date(baslangicTarihi);
      const endDate = new Date(bitisTarihi);

      // Geçerli tarih kontrolü
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ msg: "Geçersiz tarih formatı" });
      }

      // Başlangıç tarihinin bitiş tarihinden önce olması kontrolü
      if (startDate > endDate) {
        return res
          .status(400)
          .json({ msg: "Başlangıç tarihi bitiş tarihinden sonra olamaz" });
      }

      // Ay ve yıl değerlerini oluştur
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1; // JavaScript'te aylar 0'dan başlar
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;

      // Ay aralığını oluştur
      const months = [];

      for (let year = startYear; year <= endYear; year++) {
        const firstMonth = year === startYear ? startMonth : 1;
        const lastMonth = year === endYear ? endMonth : 12;

        for (let month = firstMonth; month <= lastMonth; month++) {
          months.push({
            yil: year,
            ay: month,
          });
        }
      }

      // Kişi filtreleme sorgusu oluştur
      const kisiFilter = {};
      if (kisiId) {
        kisiFilter._id = kisiId;
      }
      if (grupId) {
        kisiFilter.grup_id = grupId;
      }

      // Debug: Filtre durumunu loglayalım
      logger.info("Oluşturulan kişi filtresi:", kisiFilter);
      logger.info("Ödeme durumu filtresi:", odemeDurumu);
      logger.info("Tarih aralığı:", months);

      // Kişileri getir
      const kisiler = await Kisi.find(kisiFilter)
        .populate("grup_id", ["grupAdi"])
        .sort({ ad: 1, soyad: 1 });

      // Batchleme teknikleri ile performans artırma
      const batchSize = 50; // Kişileri batchler halinde işleyelim
      const raporVerileri = [];

      for (let i = 0; i < kisiler.length; i += batchSize) {
        const batch = kisiler.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (kisi) => {
            // Belirtilen tarih aralığındaki borçları getir
            const borcFilter = {
              kisi_id: kisi._id,
              $or: months.map((m) => ({ yil: m.yil, ay: m.ay })),
            };

            if (odemeDurumu !== "tumu") {
              borcFilter.odendi = odemeDurumu === "odendi";
            }

            const borclar = await Borc.find(borcFilter)
              .populate("ucret_id", ["ad", "tutar"])
              .sort({ yil: 1, ay: 1 });

            // Toplam değerler için tüm borç ve ödemeleri getir
            let toplamBorc = 0;
            let toplamOdeme = 0;

            // Sadece filtredeki aylar için toplam hesabı yapılacak
            borclar.forEach((borc) => {
              toplamBorc += borc.borcTutari || 0;
            });

            // Bu borçlara ait ödemeleri bul ve topla
            const borcIds = borclar.map((b) => b._id);
            if (borcIds.length > 0) {
              const odemeler = await Odeme.find({
                borc_id: { $in: borcIds },
              });
              toplamOdeme = odemeler.reduce(
                (sum, odeme) => sum + (odeme.odemeTutari || 0),
                0
              );
            }

            const kalanTutar = toplamBorc - toplamOdeme;

            // Aylık borçlar
            const aylikBorclar = months.map((month) => {
              const borc = borclar.find(
                (b) => b.yil === month.yil && b.ay === month.ay
              );

              return {
                yil: month.yil,
                ay: month.ay,
                borc: borc
                  ? {
                      _id: borc._id,
                      borcTutari: borc.borcTutari || 0,
                      kalan: borc.kalan || 0,
                      odendi: borc.odendi || false,
                      ucret: borc.ucret_id ? borc.ucret_id.ad : "",
                    }
                  : null,
              };
            });

            return {
              kisi: {
                _id: kisi._id,
                ad: kisi.ad || "",
                soyad: kisi.soyad || "",
                tcKimlik: kisi.tcKimlik || "",
                telefonNumarasi: kisi.telefonNumarasi || "",
                grup: kisi.grup_id ? kisi.grup_id.grupAdi : null,
                isActive: kisi.isActive,
              },
              aylikBorclar,
              toplamBorc,
              toplamOdeme,
              kalanTutar,
            };
          })
        );

        raporVerileri.push(...batchResults);
      }

      res.json({
        aylar: months,
        raporVerileri,
      });
    } catch (err) {
      logger.error("Aylık borç raporu oluşturulurken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/raporlar/ozet
// @desc    Sistem genel özet bilgilerini getir
// @access  Özel
router.get(
  "/ozet",
  auth,
  yetkiKontrol("raporlar_goruntuleme"),
  async (req, res) => {
    try {
      const aktifKisiSayisi = await Kisi.countDocuments({ isActive: true });
      const pasifKisiSayisi = await Kisi.countDocuments({ isActive: false });
      const grupSayisi = await Kisi.distinct("grup_id").countDocuments();

      // Toplam borç ve ödeme değerlerini daha verimli hesaplayalım
      const [toplamBorcSonuc, toplamOdemeSonuc, odenmemisBorclarSonuc] =
        await Promise.all([
          Borc.aggregate([
            { $group: { _id: null, total: { $sum: "$borcTutari" } } },
          ]),
          Odeme.aggregate([
            { $group: { _id: null, total: { $sum: "$odemeTutari" } } },
          ]),
          Borc.aggregate([
            { $match: { odendi: false } },
            { $group: { _id: null, total: { $sum: "$kalan" } } },
          ]),
        ]);

      res.json({
        aktifKisiSayisi,
        pasifKisiSayisi,
        grupSayisi,
        toplamBorc: toplamBorcSonuc.length > 0 ? toplamBorcSonuc[0].total : 0,
        toplamOdeme:
          toplamOdemeSonuc.length > 0 ? toplamOdemeSonuc[0].total : 0,
        odenmemisToplam:
          odenmemisBorclarSonuc.length > 0 ? odenmemisBorclarSonuc[0].total : 0,
      });
    } catch (err) {
      logger.error("Genel özet raporu getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
