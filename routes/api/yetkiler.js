const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const yetkiKontrol = require("../../middleware/yetki");
const { check, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Yetki = require("../../models/Yetki");
const Rol = require("../../models/Rol");

// ÖNEMLİ: Bu rotayı diğer rotalardan önce tanımlıyoruz (route sıralaması önemli)
// @route   GET api/yetkiler/moduller
// @desc    Tüm modül isimlerini getir
// @access  Özel
router.get("/moduller", auth, async (req, res) => {
  try {
    console.log(
      "Yetkiler/moduller endpoint çağrıldı. Kullanıcı ID:",
      req.user.id
    );
    // Sequelize'de distinct için findAll + group kullanılır
    const moduller = await Yetki.findAll({
      attributes: [
        [Yetki.sequelize.fn("DISTINCT", Yetki.sequelize.col("modul")), "modul"],
      ],
      raw: true,
    });
    const modulList = moduller.map((m) => m.modul);
    console.log(`${modulList.length} adet modül bulundu.`);
    res.json(modulList);
  } catch (err) {
    console.error("Modüller getirilirken hata:", err.message);
    res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
  }
});

// @route   GET api/yetkiler
// @desc    Tüm yetkileri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("yetkiler_goruntuleme"),
  async (req, res) => {
    try {
      console.log("Yetkiler endpoint çağrıldı. Kullanıcı ID:", req.user.id);
      const yetkiler = await Yetki.findAll({
        order: [
          ["modul", "ASC"],
          ["islem", "ASC"],
        ],
      });
      console.log(`${yetkiler.length} adet yetki bulundu.`);
      res.json(yetkiler);
    } catch (err) {
      console.error("Yetkileri getirme hatası:", err.message);
      res.status(500).json({ msg: "Sunucu hatası", detail: err.message });
    }
  }
);

// @route   GET api/yetkiler/:id
// @desc    ID'ye göre yetki getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("yetkiler_goruntuleme"),
  async (req, res) => {
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ msg: "Geçersiz yetki ID" });
    }
    try {
      const yetki = await Yetki.findByPk(id);
      if (!yetki) {
        return res.status(404).json({ msg: "Yetki bulunamadı" });
      }
      res.json(yetki);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/yetkiler
// @desc    Yeni yetki ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("yetkiler_ekleme"),
    [
      check("kod", "Yetki kodu gereklidir").not().isEmpty(),
      check("ad", "Yetki adı gereklidir").not().isEmpty(),
      check("modul", "Modül adı gereklidir").not().isEmpty(),
      check("islem", "İşlem türü gereklidir").isIn([
        "goruntuleme",
        "ekleme",
        "duzenleme",
        "silme",
        "ozel",
      ]),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { kod, ad, aciklama, modul, islem, isActive } = req.body;

      // Aynı kodlu yetki var mı kontrol et
      const existingYetki = await Yetki.findOne({ where: { kod } });
      if (existingYetki) {
        return res.status(400).json({ msg: "Bu kodla bir yetki zaten mevcut" });
      }

      // Yeni yetki oluştur
      const yeniYetki = await Yetki.create({
        kod,
        ad,
        aciklama,
        modul,
        islem,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.json(yeniYetki);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/yetkiler/:id
// @desc    Yetki bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  [
    auth,
    yetkiKontrol("yetkiler_duzenleme"),
    [
      check("kod", "Yetki kodu gereklidir").not().isEmpty(),
      check("ad", "Yetki adı gereklidir").not().isEmpty(),
      check("modul", "Modül adı gereklidir").not().isEmpty(),
      check("islem", "İşlem türü gereklidir").isIn([
        "goruntuleme",
        "ekleme",
        "duzenleme",
        "silme",
        "ozel",
      ]),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { kod, ad, aciklama, modul, islem, isActive } = req.body;

      // Yetki var mı kontrolü
      let yetki = await Yetki.findByPk(req.params.id);

      if (!yetki) {
        return res.status(404).json({ msg: "Yetki bulunamadı" });
      }

      // Aynı kodlu başka bir yetki var mı kontrol et
      if (kod !== yetki.kod) {
        const existingYetki = await Yetki.findOne({
          kod,
          _id: { $ne: req.params.id },
        });
        if (existingYetki) {
          return res
            .status(400)
            .json({ msg: "Bu kodla bir yetki zaten mevcut" });
        }
      }

      // Güncelleme bilgilerini ayarla
      yetki.kod = kod;
      yetki.ad = ad;
      yetki.aciklama = aciklama;
      yetki.modul = modul;
      yetki.islem = islem;
      if (isActive !== undefined) yetki.isActive = isActive;

      await yetki.save();

      res.json(yetki);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Yetki bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/yetkiler/:id
// @desc    Yetki sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("yetkiler_silme"),
  async (req, res) => {
    try {
      // Yetki var mı kontrolü
      const yetki = await Yetki.findByPk(req.params.id);

      if (!yetki) {
        return res.status(404).json({ msg: "Yetki bulunamadı" });
      }

      // Bu yetkiyi kullanan rolleri kontrol et
      const rolSayisi = await Rol.countDocuments({ yetkiler: req.params.id });

      if (rolSayisi > 0) {
        return res.status(400).json({
          msg: `Bu yetkiyi kullanan ${rolSayisi} rol bulunmaktadır. Önce rollerden bu yetkiyi kaldırın.`,
        });
      }

      await yetki.remove();
      res.json({ msg: "Yetki başarıyla silindi", id: req.params.id });
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Yetki bulunamadı" });
      }
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/yetkiler/modul/:modul
// @desc    Modüle göre yetkileri getir
// @access  Özel
router.get(
  "/modul/:modul",
  auth,
  yetkiKontrol("yetkiler_goruntuleme"),
  async (req, res) => {
    try {
      const yetkiler = await Yetki.find({ modul: req.params.modul }).sort({
        islem: 1,
      });
      res.json(yetkiler);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/yetkiler/active
// @desc    Aktif yetkileri getir
// @access  Özel
router.get(
  "/active",
  auth,
  yetkiKontrol("yetkiler_goruntuleme"),
  async (req, res) => {
    try {
      const yetkiler = await Yetki.find({ isActive: true }).sort({
        modul: 1,
        islem: 1,
      });
      res.json(yetkiler);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/yetkiler/bulk-delete
// @desc    Toplu yetki silme
// @access  Özel
router.post(
  "/bulk-delete",
  auth,
  yetkiKontrol("yetkiler_silme"),
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ msg: "Geçerli yetki ID'leri sağlanmalıdır" });
      }

      // Bu yetkileri kullanan rolleri kontrol et
      const rolSayisi = await Rol.countDocuments({ yetkiler: { $in: ids } });

      if (rolSayisi > 0) {
        return res.status(400).json({
          msg: `Bu yetkileri kullanan ${rolSayisi} rol bulunmaktadır. Önce rollerden bu yetkileri kaldırın.`,
        });
      }

      const result = await Yetki.deleteMany({ _id: { $in: ids } });

      res.json({
        msg: `${result.deletedCount} yetki başarıyla silindi`,
        silinen: ids,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/yetkiler/sync
// @desc    permissions.json ve veritabanı arasında senkronizasyon
// @access  Özel
router.post(
  "/sync",
  auth,
  yetkiKontrol("yetkiler_duzenleme"),
  async (req, res) => {
    try {
      // Permission.json dosyasını oku
      const permissionsPath = path.join(
        __dirname,
        "..",
        "..",
        "client",
        "src",
        "constants",
        "permissions.json"
      );

      if (!fs.existsSync(permissionsPath)) {
        return res
          .status(404)
          .json({ msg: "permissions.json dosyası bulunamadı" });
      }

      const permissionsRaw = fs.readFileSync(permissionsPath, "utf-8");
      const permissions = JSON.parse(permissionsRaw);

      // İstatistikler
      const stats = {
        added: 0,
        updated: 0,
        unchanged: 0,
        total: permissions.length,
        errors: [],
      };

      // Her bir yetki için işlem yap
      for (const yetkiData of permissions) {
        try {
          // Yetki var mı kontrol et
          let yetki = await Yetki.findOne({ kod: yetkiData.kod });

          if (yetki) {
            // Güncelleme gerekip gerekmediğini kontrol et
            const needsUpdate =
              yetki.ad !== yetkiData.ad ||
              yetki.modul !== yetkiData.modul ||
              yetki.islem !== yetkiData.islem ||
              yetki.aciklama !== yetkiData.aciklama;

            if (needsUpdate) {
              // Güncelleme yap
              yetki.ad = yetkiData.ad;
              yetki.modul = yetkiData.modul;
              yetki.islem = yetkiData.islem;
              yetki.aciklama = yetkiData.aciklama || yetki.aciklama;

              await yetki.save();
              stats.updated++;
            } else {
              stats.unchanged++;
            }
          } else {
            // Yeni yetki oluştur
            await new Yetki(yetkiData).save();
            stats.added++;
          }
        } catch (err) {
          stats.errors.push({
            kod: yetkiData.kod,
            error: err.message,
          });
        }
      }

      res.json({
        message: "Yetkiler başarıyla senkronize edildi",
        stats,
      });
    } catch (err) {
      console.error("Yetki senkronizasyonu hatası:", err.message);
      res.status(500).json({ msg: "Sunucu hatası", error: err.message });
    }
  }
);

module.exports = router;
