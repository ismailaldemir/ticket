const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Kasa = require("../../models/Kasa");
const Sube = require("../../models/Sube");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

// @route   GET api/kasalar
// @desc    Tüm kasaları getir
// @access  Özel
router.get("/", auth, yetkiKontrol("kasalar_goruntuleme"), async (req, res) => {
  try {
    const kasalar = await Kasa.find()
      .populate("sube_id", ["ad"])
      .populate("sorumlu_uye_id", ["uyeNo"]);
    res.json(kasalar);
  } catch (err) {
    logger.error("Kasalar getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/kasalar/active
// @desc    Aktif kasaları getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("kasalar_goruntuleme"),
  async (req, res) => {
    try {
      const kasalar = await Kasa.find({ isActive: true })
        .populate("sube_id", ["ad"])
        .sort({ kasaAdi: 1 });
      res.json(kasalar);
    } catch (err) {
      logger.error("Aktif kasalar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/kasalar/:id
// @desc    ID'ye göre kasa getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("kasalar_goruntuleme"),
  async (req, res) => {
    try {
      const kasa = await Kasa.findById(req.params.id)
        .populate("sube_id", ["ad"])
        .populate("sorumlu_uye_id", ["uyeNo"])
        .populate({
          path: "sorumlu_uye_id",
          populate: {
            path: "kisi_id",
            select: "ad soyad",
          },
        });

      if (!kasa) {
        return res.status(404).json({ msg: "Kasa bulunamadı" });
      }

      res.json(kasa);
    } catch (err) {
      logger.error("Kasa getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kasa bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/kasalar/sube/:sube_id
// @desc    Şubeye göre kasaları getir
// @access  Özel
router.get(
  "/sube/:sube_id",
  auth,
  yetkiKontrol("kasalar_goruntuleme"),
  async (req, res) => {
    try {
      const kasalar = await Kasa.find({ sube_id: req.params.sube_id }).sort({
        kasaAdi: 1,
      });
      res.json(kasalar);
    } catch (err) {
      logger.error("Şubeye göre kasalar getirilirken hata", {
        error: err.message,
      });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/kasalar
// @desc    Yeni kasa ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("kasalar_ekleme"),
    [
      check("kasaAdi", "Kasa adı gereklidir").not().isEmpty(),
      check("sube_id", "Şube bilgisi gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sube_id, kasaAdi, sorumlu_uye_id, aciklama, isActive } = req.body;

    try {
      // Şube var mı kontrolü
      const sube = await Sube.findById(sube_id);
      if (!sube) {
        return res.status(404).json({ msg: "Şube bulunamadı" });
      }

      // Aynı isimde kasa var mı kontrolü
      const existingKasa = await Kasa.findOne({
        sube_id,
        kasaAdi,
      });

      if (existingKasa) {
        return res
          .status(400)
          .json({ msg: "Bu şube için bu isimde bir kasa zaten mevcut" });
      }

      // Yeni kasa oluştur
      const kasa = new Kasa({
        sube_id,
        kasaAdi,
        sorumlu_uye_id: sorumlu_uye_id || null,
        aciklama,
        isActive: isActive !== undefined ? isActive : true,
      });

      await kasa.save();

      // İlişkilendirmeyi otomatik yapalım
      const populatedKasa = await Kasa.findById(kasa._id)
        .populate("sube_id", ["ad"])
        .populate("sorumlu_uye_id", ["uyeNo"])
        .populate({
          path: "sorumlu_uye_id",
          populate: {
            path: "kisi_id",
            select: "ad soyad",
          },
        });

      res.json(populatedKasa);
    } catch (err) {
      logger.error("Kasa eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/kasalar/:id
// @desc    Kasa bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("kasalar_guncelleme"),
  async (req, res) => {
    const { sube_id, kasaAdi, sorumlu_uye_id, aciklama, isActive } = req.body;

    // Kasa güncelleme objesi
    const kasaGuncelleme = {};
    if (sube_id) kasaGuncelleme.sube_id = sube_id;
    if (kasaAdi) kasaGuncelleme.kasaAdi = kasaAdi;
    // Sorumlu üye ID değişikliği için kontrol - boş string ise null atanacak
    if (sorumlu_uye_id === "") {
      kasaGuncelleme.sorumlu_uye_id = null;
    } else if (sorumlu_uye_id) {
      kasaGuncelleme.sorumlu_uye_id = sorumlu_uye_id;
    }
    if (aciklama !== undefined) kasaGuncelleme.aciklama = aciklama;
    if (isActive !== undefined) kasaGuncelleme.isActive = isActive;

    try {
      // Kasa var mı kontrolü
      let kasa = await Kasa.findById(req.params.id);

      if (!kasa) {
        return res.status(404).json({ msg: "Kasa bulunamadı" });
      }

      // Aynı isimde başka bir kasa var mı kontrol et (isim veya şube değişiyorsa)
      if (
        (kasaAdi && kasaAdi !== kasa.kasaAdi) ||
        (sube_id && sube_id !== kasa.sube_id.toString())
      ) {
        const checkSubeId = sube_id || kasa.sube_id;
        const checkKasaAdi = kasaAdi || kasa.kasaAdi;

        const existingKasa = await Kasa.findOne({
          kasaAdi: checkKasaAdi,
          sube_id: checkSubeId,
          _id: { $ne: req.params.id },
        });

        if (existingKasa) {
          return res
            .status(400)
            .json({ msg: "Bu isimde bir kasa bu şubede zaten mevcut" });
        }
      }

      // Güncelleme yap
      kasa = await Kasa.findByIdAndUpdate(
        req.params.id,
        { $set: kasaGuncelleme },
        { new: true }
      )
        .populate("sube_id", ["ad"])
        .populate("sorumlu_uye_id", ["uyeNo"])
        .populate({
          path: "sorumlu_uye_id",
          populate: {
            path: "kisi_id",
            select: "ad soyad",
          },
        });

      res.json(kasa);
    } catch (err) {
      logger.error("Kasa güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Kasa bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/kasalar/:id
// @desc    Kasa sil
// @access  Özel
router.delete("/:id", auth, yetkiKontrol("kasalar_silme"), async (req, res) => {
  try {
    // Kasa var mı kontrolü
    const kasa = await Kasa.findById(req.params.id);

    if (!kasa) {
      return res.status(404).json({ msg: "Kasa bulunamadı" });
    }

    // TODO: Bu kasaya bağlı ödemeler var mı kontrol et
    // Eğer bu kasa ile ilişkili ödemeler eklenirse, burada kontrol edilmeli

    // Kasayı sil
    await kasa.remove();

    res.json({ msg: "Kasa silindi" });
  } catch (err) {
    logger.error("Kasa silinirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Kasa bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/kasalar/delete-many
// @desc    Birden fazla kasa sil
// @access  Özel
router.post(
  "/delete-many",
  auth,
  yetkiKontrol("kasalar_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Silinecek ID listesi geçerli değil" });
      }

      // TODO: Bu kasalara bağlı ödemeler var mı kontrol et
      // Eğer bu kasalarla ilişkili ödemeler eklenirse, burada kontrol edilmeli

      // Toplu silme işlemi için
      const result = await Kasa.deleteMany({ _id: { $in: ids } });

      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: "Silinecek kasa bulunamadı" });
      }

      res.json({
        msg: `${result.deletedCount} adet kasa silindi`,
        count: result.deletedCount,
      });
    } catch (err) {
      logger.error("Birden fazla kasa silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
