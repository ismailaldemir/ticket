const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const logger = require("../../utils/logger");

// Model importlarını düzelt - doğru yollara işaret etmeli
const RandevuTanimi = require("../../models/RandevuTanimi");
const RandevuSlot = require("../../models/RandevuSlot");
// Burada Kisi modeli direkt olarak import edilir
const Kisi = require("../../models/Kisi");
const Cari = require("../../models/Cari");

// @route   GET api/randevu-slotlari
// @desc    Tüm randevu slotlarını getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("randevu_slotlari_goruntuleme"),
  async (req, res) => {
    const { baslangicTarihi, bitisTarihi, durum, randevuTanimi_id } = req.query;
    let query = {};

    // Tarih aralığı filtreleme
    if (baslangicTarihi || bitisTarihi) {
      query.tarih = {};
      if (baslangicTarihi) {
        query.tarih.$gte = new Date(baslangicTarihi);
      }
      if (bitisTarihi) {
        const bitisDate = new Date(bitisTarihi);
        bitisDate.setHours(23, 59, 59, 999);
        query.tarih.$lte = bitisDate;
      }
    }

    // Durum filtreleme
    if (durum && durum !== "Tümü") {
      query.durum = durum;
    }

    // Randevu tanımı filtreleme
    if (randevuTanimi_id) {
      query.randevuTanimi_id = randevuTanimi_id;
    }

    try {
      const randevuSlotlari = await RandevuSlot.find(query)
        .sort({ tarih: 1, baslangicZamani: 1 })
        .populate("randevuTanimi_id", "ad")
        .populate({ path: "kisi_id", select: "ad soyad", model: "kisi" })
        .populate({ path: "cari_id", select: "cariAd", model: "cari" })
        .populate({
          path: "olusturanKullanici_id",
          select: "name",
          model: "user",
        });

      res.json(randevuSlotlari);
    } catch (err) {
      logger.error("Randevu slotları getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/randevu-slotlari/:id
// @desc    ID'ye göre randevu slotunu getir
// @access  Özel
router.get(
  "/:id",
  [auth, yetkiKontrol("randevular_goruntuleme")],
  async (req, res) => {
    try {
      const randevuSlot = await RandevuSlot.findById(req.params.id)
        .populate("randevuTanimi_id")
        .populate({ path: "kisi_id", select: "ad soyad", model: "kisi" })
        .populate({ path: "cari_id", select: "cariAd", model: "cari" })
        .populate({
          path: "olusturanKullanici_id",
          select: "name",
          model: "user",
        });

      if (!randevuSlot) {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      res.json(randevuSlot);
    } catch (err) {
      logger.error("Randevu slotu getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/randevu-slotlari/toplu-olustur
// @desc    Belirli tarih aralığında randevu slotlarını oluştur
// @access  Özel
router.post(
  "/toplu-olustur",
  [
    auth,
    yetkiKontrol("randevular_ekleme"),
    [
      check("randevuTanimi_id", "Randevu tanımı ID'si gereklidir")
        .not()
        .isEmpty(),
      check("baslangicTarihi", "Başlangıç tarihi gereklidir").isDate(),
      check("bitisTarihi", "Bitiş tarihi gereklidir").isDate(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { randevuTanimi_id, baslangicTarihi, bitisTarihi } = req.body;

    try {
      // Randevu tanımını getir
      const randevuTanimi = await RandevuTanimi.findById(randevuTanimi_id);
      if (!randevuTanimi) {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      // Oluşturulacak randevu slotlarını hesapla
      const baslangicDate = new Date(baslangicTarihi);
      const bitisDate = new Date(bitisTarihi);
      const gunler = randevuTanimi.gunler;

      const randevuSlotlari = [];

      // Tarih aralığındaki her gün için
      for (
        let date = new Date(baslangicDate);
        date <= bitisDate;
        date.setDate(date.getDate() + 1)
      ) {
        const gun = date.getDay(); // 0: Pazar, 1: Pazartesi, ..., 6: Cumartesi

        // Eğer bu gün randevu tanımında belirtilen günlerden biriyse
        if (gunler.includes(gun)) {
          // Başlangıç ve bitiş saatlerini ayır
          const [basSaat, basDakika] = randevuTanimi.baslangicSaati
            .split(":")
            .map(Number);
          const [bitSaat, bitDakika] = randevuTanimi.bitisSaati
            .split(":")
            .map(Number);

          // O gün için başlangıç ve bitiş zamanlarını hesapla
          const gunBaslangic = new Date(date);
          gunBaslangic.setHours(basSaat, basDakika, 0, 0);

          const gunBitis = new Date(date);
          gunBitis.setHours(bitSaat, bitDakika, 0, 0);

          // Eğer bitiş zamanı başlangıçtan önceyse (örn: 23:00'dan 01:00'a)
          if (gunBitis < gunBaslangic) {
            gunBitis.setDate(gunBitis.getDate() + 1);
          }

          // Slot süresi (dakika)
          const slotSuresi = randevuTanimi.slotSuresiDk;

          // O gün için tüm slotları oluştur
          for (
            let slotBaslangic = new Date(gunBaslangic);
            slotBaslangic < gunBitis;
            slotBaslangic.setMinutes(slotBaslangic.getMinutes() + slotSuresi)
          ) {
            const slotBitis = new Date(slotBaslangic);
            slotBitis.setMinutes(slotBitis.getMinutes() + slotSuresi);

            // Eğer slot bitiş zamanı günün bitiş zamanını geçiyorsa, bu slotu atlayalım
            if (slotBitis > gunBitis) {
              continue;
            }

            randevuSlotlari.push({
              randevuTanimi_id,
              tarih: new Date(date),
              baslangicZamani: new Date(slotBaslangic),
              bitisZamani: new Date(slotBitis),
              durum: "Açık",
              olusturanKullanici_id: req.user.id,
              isActive: true,
            });
          }
        }
      }

      // Hiç randevu slotu oluşturulmadıysa uyarı ver
      if (randevuSlotlari.length === 0) {
        return res.status(400).json({
          msg: "Seçilen tarih aralığında ve tanımlanan günlerde hiç randevu slotu oluşturulamadı",
        });
      }

      // Randevu slotlarını toplu olarak ekle
      await RandevuSlot.insertMany(randevuSlotlari);

      res.json({
        msg: `${randevuSlotlari.length} randevu slotu başarıyla oluşturuldu`,
        toplamSlot: randevuSlotlari.length,
      });
    } catch (err) {
      logger.error("Toplu randevu slotu oluştururken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/randevu-slotlari
// @desc    Yeni randevu slotu ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("randevular_ekleme"),
    [
      check("randevuTanimi_id", "Randevu tanımı ID'si gereklidir")
        .not()
        .isEmpty(),
      // Daha esnek tarih doğrulaması kullan
      check("tarih").custom((value) => {
        if (!value) {
          throw new Error("Tarih gereklidir");
        }
        // ISO string olarak gelse bile kabul et
        try {
          new Date(value);
          return true;
        } catch (e) {
          throw new Error("Geçersiz tarih formatı");
        }
      }),
      check("baslangicZamani", "Başlangıç zamanı gereklidir").isISO8601(),
      check("bitisZamani", "Bitiş zamanı gereklidir").isISO8601(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      randevuTanimi_id,
      tarih,
      baslangicZamani,
      bitisZamani,
      durum,
      aciklama,
      kisi_id,
      cari_id,
      notlar,
      isActive,
    } = req.body;

    try {
      // Randevu tanımını kontrol et
      const randevuTanimi = await RandevuTanimi.findById(randevuTanimi_id);
      if (!randevuTanimi) {
        return res.status(404).json({ msg: "Randevu tanımı bulunamadı" });
      }

      // Kişi kontrolü
      if (kisi_id) {
        const kisi = await Kisi.findById(kisi_id);
        if (!kisi) {
          return res.status(404).json({ msg: "Kişi bulunamadı" });
        }
      }

      // Cari kontrolü
      if (cari_id) {
        const cari = await Cari.findById(cari_id);
        if (!cari) {
          return res.status(404).json({ msg: "Cari bulunamadı" });
        }
      }

      // Yeni randevu slotu oluştur
      const yeniRandevuSlot = new RandevuSlot({
        randevuTanimi_id,
        tarih: new Date(tarih),
        baslangicZamani: new Date(baslangicZamani),
        bitisZamani: new Date(bitisZamani),
        durum: durum || "Açık",
        aciklama,
        kisi_id: kisi_id || null,
        cari_id: cari_id || null,
        notlar,
        isActive: isActive !== undefined ? isActive : true,
        olusturanKullanici_id: req.user.id,
      });

      const randevuSlot = await yeniRandevuSlot.save();

      // Kaydedilen slotu populate ederek tekrar getir
      const populatedSlot = await RandevuSlot.findById(randevuSlot._id)
        .populate("randevuTanimi_id", "ad")
        .populate({ path: "kisi_id", select: "ad soyad", model: "kisi" })
        .populate({ path: "cari_id", select: "cariAd", model: "cari" })
        .populate({
          path: "olusturanKullanici_id",
          select: "name",
          model: "user",
        });

      res.json(populatedSlot);
    } catch (err) {
      logger.error("Randevu slotu eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/randevu-slotlari/:id
// @desc    Randevu slotunu güncelle
// @access  Özel
router.put(
  "/:id",
  [auth, yetkiKontrol("randevular_duzenleme")],
  async (req, res) => {
    const {
      randevuTanimi_id,
      tarih,
      baslangicZamani,
      bitisZamani,
      durum,
      aciklama,
      kisi_id,
      cari_id,
      notlar,
      iptalNedeni,
      isActive,
    } = req.body;

    // Slot güncelleme nesnesi
    const slotGuncelleme = {};
    if (randevuTanimi_id) slotGuncelleme.randevuTanimi_id = randevuTanimi_id;
    if (tarih) slotGuncelleme.tarih = new Date(tarih);
    if (baslangicZamani)
      slotGuncelleme.baslangicZamani = new Date(baslangicZamani);
    if (bitisZamani) slotGuncelleme.bitisZamani = new Date(bitisZamani);
    if (durum) slotGuncelleme.durum = durum;
    if (aciklama !== undefined) slotGuncelleme.aciklama = aciklama;
    if (kisi_id !== undefined)
      slotGuncelleme.kisi_id = kisi_id === "" ? null : kisi_id;
    if (cari_id !== undefined)
      slotGuncelleme.cari_id = cari_id === "" ? null : cari_id;
    if (notlar !== undefined) slotGuncelleme.notlar = notlar;
    if (iptalNedeni !== undefined) slotGuncelleme.iptalNedeni = iptalNedeni;
    if (isActive !== undefined) slotGuncelleme.isActive = isActive;

    try {
      // Slot var mı kontrolü
      let slot = await RandevuSlot.findById(req.params.id);

      if (!slot) {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      // Kişi veya cari ataması yapılacaksa, randevu durumunu da güncelle
      if (
        (kisi_id && kisi_id !== slot.kisi_id) ||
        (cari_id && cari_id !== slot.cari_id)
      ) {
        slotGuncelleme.durum = "Rezerve";
      }

      // Güncelleme
      slot = await RandevuSlot.findByIdAndUpdate(
        req.params.id,
        { $set: slotGuncelleme },
        { new: true }
      )
        .populate("randevuTanimi_id")
        .populate({ path: "kisi_id", select: "ad soyad", model: "kisi" })
        .populate({ path: "cari_id", select: "cariAd", model: "cari" })
        .populate({
          path: "olusturanKullanici_id",
          select: "name",
          model: "user",
        });

      res.json(slot);
    } catch (err) {
      logger.error("Randevu slotu güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/randevu-slotlari/durum-guncelle/:id
// @desc    Randevu slot durumunu güncelle
// @access  Özel
router.put(
  "/durum-guncelle/:id",
  [auth, yetkiKontrol("randevular_duzenleme")],
  async (req, res) => {
    const { durum, iptalNedeni } = req.body;

    try {
      // Slot var mı kontrolü
      let slot = await RandevuSlot.findById(req.params.id);

      if (!slot) {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      const guncelleme = { durum };

      // İptal nedeni sadece iptal durumunda eklensin
      if (durum === "Kapalı" && iptalNedeni) {
        guncelleme.iptalNedeni = iptalNedeni;
      }

      // Durumu güncelle
      slot = await RandevuSlot.findByIdAndUpdate(
        req.params.id,
        { $set: guncelleme },
        { new: true }
      )
        .populate("randevuTanimi_id")
        .populate({ path: "kisi_id", select: "ad soyad", model: "kisi" })
        .populate({ path: "cari_id", select: "cariAd", model: "cari" })
        .populate({
          path: "olusturanKullanici_id",
          select: "name",
          model: "user",
        });

      res.json(slot);
    } catch (err) {
      logger.error("Randevu slot durumu güncellenirken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/randevu-slotlari/:id
// @desc    Randevu slotunu sil
// @access  Özel
router.delete(
  "/:id",
  [auth, yetkiKontrol("randevular_silme")],
  async (req, res) => {
    try {
      const randevuSlot = await RandevuSlot.findById(req.params.id);

      if (!randevuSlot) {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      await randevuSlot.remove();
      res.json({ msg: "Randevu slotu silindi" });
    } catch (err) {
      logger.error("Randevu slotu silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/randevu-slotlari
// @desc    Çoklu randevu slotunu sil
// @access  Özel
router.post(
  "/delete-many",
  [auth, yetkiKontrol("randevular_silme")],
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek randevu slotlarının ID'leri gereklidir" });
      }

      await RandevuSlot.deleteMany({ _id: { $in: ids } });
      res.json({ msg: `${ids.length} randevu slotu silindi` });
    } catch (err) {
      logger.error("Çoklu randevu slotu silinirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/randevu-slotlari/rezervasyon
// @desc    Randevu slotuna rezervasyon yap
// @access  Özel
router.post(
  "/rezervasyon/:id",
  [
    auth,
    yetkiKontrol("randevular_duzenleme"),
    [check("durum", "Durum gereklidir").isIn(["Açık", "Kapalı", "Rezerve"])],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { kisi_id, cari_id, durum, notlar } = req.body;

    try {
      // Slot var mı kontrolü
      let slot = await RandevuSlot.findById(req.params.id);

      if (!slot) {
        return res.status(404).json({ msg: "Randevu slotu bulunamadı" });
      }

      // Slot durumunu kontrol et
      if (slot.durum === "Kapalı") {
        return res
          .status(400)
          .json({ msg: "Bu randevu slotu kapalıdır ve rezervasyon yapılamaz" });
      }

      // Eğer başka kişi veya cari tarafından rezerve edildiyse kontrol et
      if (slot.durum === "Rezerve" && (slot.kisi_id || slot.cari_id)) {
        return res
          .status(400)
          .json({ msg: "Bu randevu slotu zaten rezerve edilmiş" });
      }

      // Güncelleme nesnesini oluştur
      const guncelleme = {
        durum,
        notlar: notlar || "",
      };

      // Kişi atanmışsa
      if (kisi_id) {
        const kisi = await Kisi.findById(kisi_id);
        if (!kisi) {
          return res.status(404).json({ msg: "Kişi bulunamadı" });
        }
        guncelleme.kisi_id = kisi_id;
      }

      // Cari atanmışsa
      if (cari_id) {
        const cari = await Cari.findById(cari_id);
        if (!cari) {
          return res.status(404).json({ msg: "Cari bulunamadı" });
        }
        guncelleme.cari_id = cari_id;
      }

      // Rezervasyon yap
      slot = await RandevuSlot.findByIdAndUpdate(
        req.params.id,
        { $set: guncelleme },
        { new: true }
      )
        .populate("randevuTanimi_id")
        .populate({ path: "kisi_id", select: "ad soyad", model: "kisi" })
        .populate({ path: "cari_id", select: "cariAd", model: "cari" })
        .populate({
          path: "olusturanKullanici_id",
          select: "name",
          model: "user",
        });

      res.json(slot);
    } catch (err) {
      logger.error("Randevu rezervasyonu yapılırken hata", {
        error: err.message,
      });

      if (err.kind === "ObjectId") {
        return res
          .status(404)
          .json({ msg: "Randevu slotu veya kişi/cari bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
