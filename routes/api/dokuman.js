const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Dokuman = require("../../models/Dokuman");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { referansTur } = req.body;
    const uploadDir = `uploads/${referansTur.toLowerCase()}lar`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// @route   POST api/dokuman
// @desc    Yeni dokuman ekle
router.post(
  "/",
  [auth, yetkiKontrol("dokuman_ekleme"), upload.single("dosya")],
  async (req, res) => {
    try {
      const { referansId, referansTur, aciklama, etiketler } = req.body;
      const file = req.file;

      let ekTur = "Diğer";
      if (file.mimetype.startsWith("image/")) ekTur = "Resim";
      else if (file.mimetype.startsWith("video/")) ekTur = "Video";
      else if (file.mimetype.startsWith("audio/")) ekTur = "Ses";
      else if (
        file.mimetype.includes("pdf") ||
        file.mimetype.includes("document") ||
        file.mimetype.includes("sheet")
      )
        ekTur = "Belge";

      const dokuman = new Dokuman({
        referansId,
        referansTur,
        dosyaAdi: file.filename,
        orijinalDosyaAdi: file.originalname,
        dosyaYolu: file.path.replace(/\\/g, "/"),
        dosyaBoyutu: file.size,
        mimeTur: file.mimetype,
        ekTur,
        aciklama,
        etiketler: etiketler ? JSON.parse(etiketler) : [],
        yukleyenId: req.user.id,
      });

      await dokuman.save();
      res.json(dokuman);
    } catch (err) {
      logger.error("Doküman eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/dokuman/:referansTur/:referansId
// @desc    Dokumanları getir
router.get(
  "/:referansTur/:referansId",
  auth,
  yetkiKontrol("dokuman_goruntuleme"),
  async (req, res) => {
    try {
      const { referansTur, referansId } = req.params;
      const dokumanlar = await Dokuman.find({
        referansTur,
        referansId,
        isActive: true,
      }).sort("-yuklemeTarihi");

      res.json(dokumanlar);
    } catch (err) {
      logger.error("Dokümanlar getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/dokuman/:id
// @desc    Dokuman sil
router.delete(
  "/:id",
  [auth, yetkiKontrol("dokuman_silme")],
  async (req, res) => {
    try {
      const dokuman = await Dokuman.findById(req.params.id);
      if (!dokuman) return res.status(404).json({ msg: "Dokuman bulunamadı" });

      // Dosyayı fiziksel olarak sil
      if (fs.existsSync(dokuman.dosyaYolu)) {
        fs.unlinkSync(dokuman.dosyaYolu);
      }

      await dokuman.remove();
      res.json({ msg: "Dokuman silindi" });
    } catch (err) {
      logger.error("Doküman silinirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

module.exports = router;
