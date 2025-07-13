const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const logger = require("../../utils/logger");
const yetkiKontrol = require("../../middleware/yetki");

const Proje = require("../../models/Proje");
const Gorev = require("../../models/Gorev");
const Kisi = require("../../models/Kisi");

// @route   GET api/projeler
// @desc    Tüm projeleri getir
// @access  Özel
router.get(
  "/",
  auth,
  yetkiKontrol("projeler_goruntuleme"),
  async (req, res) => {
    try {
      const projeler = await Proje.find()
        .populate("sorumluKisi_id", ["ad", "soyad"])
        .sort({ kayitTarihi: -1 });
      logger.info("Tüm projeler getirildi", { count: projeler.length });
      res.json(projeler);
    } catch (err) {
      logger.error("Projeler getirilirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/projeler/:id
// @desc    ID'ye göre proje getir
// @access  Özel
router.get(
  "/:id",
  auth,
  yetkiKontrol("projeler_goruntuleme"),
  async (req, res) => {
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ msg: "Geçersiz proje ID" });
    }
    // ...existing code...
  }
);
      const proje = await Proje.findById(req.params.id).populate(
        "sorumluKisi_id",
        ["ad", "soyad"]
      );

      if (!proje) {
        logger.warn("Proje bulunamadı", { id: req.params.id });
        return res.status(404).json({ msg: "Proje bulunamadı" });
      }

      res.json(proje);
    } catch (err) {
      logger.error("Proje getirilirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Proje bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   GET api/projeler/gorevler/:proje_id
// @desc    Projeye ait görevleri getir
// @access  Özel
router.get("/gorevler/:proje_id", auth, async (req, res) => {
  try {
    const gorevler = await Gorev.find({ proje_id: req.params.proje_id })
      .populate("atananKisi_id", ["ad", "soyad"])
      .sort({ kayitTarihi: -1 });
    res.json(gorevler);
  } catch (err) {
    logger.error("Görevler getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/projeler
// @desc    Yeni proje ekle
// @access  Özel
router.post(
  "/",
  [
    auth,
    yetkiKontrol("projeler_ekleme"),
    [check("projeAdi", "Proje adı gereklidir").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      projeAdi,
      aciklama,
      baslamaTarihi,
      bitisTarihi,
      durumu,
      oncelik,
      sorumluKisi_id,
      isActive,
      tamamlanmaDurumu,
      etiketler,
    } = req.body;

    try {
      // Sorumlu kişi kontrolü
      if (sorumluKisi_id) {
        const kisi = await Kisi.findById(sorumluKisi_id);
        if (!kisi) {
          return res
            .status(404)
            .json({ msg: "Belirtilen sorumlu kişi bulunamadı" });
        }
      }

      // Yeni proje oluştur
      const yeniProje = new Proje({
        projeAdi,
        aciklama,
        baslamaTarihi: baslamaTarihi || Date.now(),
        bitisTarihi,
        durumu: durumu || "Planlandı",
        oncelik: oncelik || "Orta",
        sorumluKisi_id,
        isActive: isActive !== undefined ? isActive : true,
        tamamlanmaDurumu: tamamlanmaDurumu || 0,
        etiketler: etiketler || [],
      });

      await yeniProje.save();

      // Sorumlu kişi bilgisiyle populate et
      const populatedProje = await Proje.findById(yeniProje._id).populate(
        "sorumluKisi_id",
        ["ad", "soyad"]
      );

      res.json(populatedProje);
    } catch (err) {
      logger.error("Proje eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   POST api/projeler/gorevler
// @desc    Projeye görev ekle
// @access  Özel
router.post(
  "/gorevler",
  [
    auth,
    [
      check("proje_id", "Proje ID gereklidir").not().isEmpty(),
      check("gorevAdi", "Görev adı gereklidir").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      proje_id,
      gorevAdi,
      aciklama,
      atananKisi_id,
      gorevTuru, // Yeni görev türü alanı
      durumu,
      oncelik,
      baslangicTarihi,
      bitisTarihi,
      isActive,
      tamamlanmaDurumu,
      etiketler,
    } = req.body;

    try {
      // Proje var mı kontrolü
      const proje = await Proje.findById(proje_id);
      if (!proje) {
        return res.status(404).json({ msg: "Belirtilen proje bulunamadı" });
      }

      // Atanan kişi var mı kontrolü (sadece atanan kişi belirtildiyse)
      if (atananKisi_id && atananKisi_id !== "") {
        const kisi = await Kisi.findById(atananKisi_id);
        if (!kisi) {
          return res
            .status(404)
            .json({ msg: "Belirtilen atanan kişi bulunamadı" });
        }
      }

      // Yeni görev oluştur
      const yeniGorev = new Gorev({
        proje_id,
        gorevAdi,
        aciklama,
        atananKisi_id: atananKisi_id === "" ? null : atananKisi_id, // Boşsa null ata
        gorevTuru: gorevTuru || "Proje", // Varsayılan değer "Proje"
        durumu: durumu || "Yapılacak",
        oncelik: oncelik || "Orta",
        baslangicTarihi: baslangicTarihi || Date.now(),
        bitisTarihi,
        isActive: isActive !== undefined ? isActive : true,
        tamamlanmaDurumu: tamamlanmaDurumu || 0,
        etiketler: etiketler || [],
      });

      await yeniGorev.save();

      // Atanan kişi bilgisiyle populate et
      const populatedGorev = await Gorev.findById(yeniGorev._id).populate(
        "atananKisi_id",
        ["ad", "soyad"]
      );

      res.json(populatedGorev);
    } catch (err) {
      logger.error("Görev eklenirken hata", { error: err.message });
      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/projeler/:id
// @desc    Proje bilgilerini güncelle
// @access  Özel
router.put(
  "/:id",
  auth,
  yetkiKontrol("projeler_guncelleme"),
  async (req, res) => {
    const {
      projeAdi,
      aciklama,
      baslamaTarihi,
      bitisTarihi,
      durumu,
      oncelik,
      sorumluKisi_id,
      isActive,
      tamamlanmaDurumu,
      etiketler,
    } = req.body;

    // Proje güncelleme objesi
    const projeGuncelleme = {};
    if (projeAdi) projeGuncelleme.projeAdi = projeAdi;
    if (aciklama !== undefined) projeGuncelleme.aciklama = aciklama;
    if (baslamaTarihi) projeGuncelleme.baslamaTarihi = baslamaTarihi;
    if (bitisTarihi !== undefined) projeGuncelleme.bitisTarihi = bitisTarihi;
    if (durumu) projeGuncelleme.durumu = durumu;
    if (oncelik) projeGuncelleme.oncelik = oncelik;
    if (sorumluKisi_id !== undefined)
      projeGuncelleme.sorumluKisi_id =
        sorumluKisi_id === "" ? null : sorumluKisi_id;
    if (isActive !== undefined) projeGuncelleme.isActive = isActive;
    if (tamamlanmaDurumu !== undefined)
      projeGuncelleme.tamamlanmaDurumu = tamamlanmaDurumu;
    if (etiketler) projeGuncelleme.etiketler = etiketler;

    try {
      // Proje var mı kontrolü
      let proje = await Proje.findById(req.params.id);

      if (!proje) {
        return res.status(404).json({ msg: "Proje bulunamadı" });
      }

      // Sorumlu kişi kontrolü
      if (sorumluKisi_id && sorumluKisi_id !== "") {
        const kisi = await Kisi.findById(sorumluKisi_id);
        if (!kisi) {
          return res
            .status(404)
            .json({ msg: "Belirtilen sorumlu kişi bulunamadı" });
        }
      }

      // Güncelleme yap
      proje = await Proje.findByIdAndUpdate(
        req.params.id,
        { $set: projeGuncelleme },
        { new: true }
      ).populate("sorumluKisi_id", ["ad", "soyad"]);

      res.json(proje);
    } catch (err) {
      logger.error("Proje güncellenirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Proje bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   PUT api/projeler/gorevler/:id
// @desc    Görev bilgilerini güncelle
// @access  Özel
router.put("/gorevler/:id", auth, async (req, res) => {
  const {
    gorevAdi,
    aciklama,
    atananKisi_id,
    gorevTuru, // Yeni görev türü alanı
    durumu,
    oncelik,
    baslangicTarihi,
    bitisTarihi,
    isActive,
    tamamlanmaDurumu,
    etiketler,
  } = req.body;

  // Görev güncelleme objesi
  const gorevGuncelleme = {};
  if (gorevAdi) gorevGuncelleme.gorevAdi = gorevAdi;
  if (aciklama !== undefined) gorevGuncelleme.aciklama = aciklama;
  if (atananKisi_id !== undefined)
    gorevGuncelleme.atananKisi_id = atananKisi_id === "" ? null : atananKisi_id;
  if (gorevTuru) gorevGuncelleme.gorevTuru = gorevTuru;
  if (durumu) gorevGuncelleme.durumu = durumu;
  if (oncelik) gorevGuncelleme.oncelik = oncelik;
  if (baslangicTarihi) gorevGuncelleme.baslangicTarihi = baslangicTarihi;
  if (bitisTarihi !== undefined) gorevGuncelleme.bitisTarihi = bitisTarihi;
  if (isActive !== undefined) gorevGuncelleme.isActive = isActive;
  if (tamamlanmaDurumu !== undefined)
    gorevGuncelleme.tamamlanmaDurumu = tamamlanmaDurumu;
  if (etiketler) gorevGuncelleme.etiketler = etiketler;

  try {
    // Görev var mı kontrolü
    let gorev = await Gorev.findById(req.params.id);

    if (!gorev) {
      return res.status(404).json({ msg: "Görev bulunamadı" });
    }

    // Atanan kişi kontrolü
    if (atananKisi_id && atananKisi_id !== "") {
      const kisi = await Kisi.findById(atananKisi_id);
      if (!kisi) {
        return res
          .status(404)
          .json({ msg: "Belirtilen atanan kişi bulunamadı" });
      }
    }

    // Güncelleme yap
    gorev = await Gorev.findByIdAndUpdate(
      req.params.id,
      { $set: gorevGuncelleme },
      { new: true }
    ).populate("atananKisi_id", ["ad", "soyad"]);

    res.json(gorev);
  } catch (err) {
    logger.error("Görev güncellenirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Görev bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

// @route   DELETE api/projeler/:id
// @desc    Proje sil
// @access  Özel
router.delete(
  "/:id",
  auth,
  yetkiKontrol("projeler_silme"),
  async (req, res) => {
    try {
      // Proje var mı kontrolü
      const proje = await Proje.findById(req.params.id);

      if (!proje) {
        return res.status(404).json({ msg: "Proje bulunamadı" });
      }

      // Önce projeye ait görevleri sil
      await Gorev.deleteMany({ proje_id: req.params.id });

      // Ardından proje kaydını sil
      await proje.remove();

      logger.info("Proje silindi", { id: req.params.id });
      res.json({ msg: "Proje ve görevleri silindi" });
    } catch (err) {
      logger.error("Proje silinirken hata", { error: err.message });

      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Proje bulunamadı" });
      }

      res.status(500).send("Sunucu hatası");
    }
  }
);

// @route   DELETE api/projeler/gorevler/:id
// @desc    Görev sil
// @access  Özel
router.delete("/gorevler/:id", auth, async (req, res) => {
  try {
    // Görev var mı kontrolü
    const gorev = await Gorev.findById(req.params.id);

    if (!gorev) {
      return res.status(404).json({ msg: "Görev bulunamadı" });
    }

    // Görevi sil
    await gorev.remove();

    logger.info("Görev silindi", { id: req.params.id });
    res.json({ msg: "Görev silindi" });
  } catch (err) {
    logger.error("Görev silinirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Görev bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

// @route   POST api/projeler/delete-many
// @desc    Birden fazla proje silme
// @access  Özel
router.post("/delete-many", auth, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ msg: "Silinecek ID listesi geçerli değil" });
    }

    // İlişkili görevleri sil
    await Gorev.deleteMany({ proje_id: { $in: ids } });

    // Ardından projeleri sil
    const result = await Proje.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "Silinecek proje kaydı bulunamadı" });
    }

    logger.info("Birden fazla proje silindi", { count: result.deletedCount });
    res.json({
      msg: `${result.deletedCount} adet proje ve ilişkili görevleri silindi`,
      count: result.deletedCount,
    });
  } catch (err) {
    logger.error("Birden fazla proje silinirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/projeler/gorevler
// @desc    Tüm görevleri getir - Yeni endpoint mantığı
// @access  Private
router.get("/gorevler", auth, async (req, res) => {
  try {
    // getAllTasks ve includeGenelGorevler query parametrelerini al
    const { getAllTasks, includeGenelGorevler } = req.query;

    let query = {};

    // Eğer tüm görevleri istiyorsa boş query gönder
    // Aksi halde ObjectId validasyonu gerektiren bir query oluştur
    if (getAllTasks !== "true") {
      if (!req.params.id) {
        return res.status(400).json({ msg: "Proje ID'si gereklidir" });
      }
      // Belirli bir projeye ait görevleri getir
      query.proje_id = req.params.id;
    }

    // Genel görevleri dahil etme/çıkarma durumunu kontrol et
    if (includeGenelGorevler === "true") {
      // Genel görevleri dahil et (projesiz görevler veya special flag'e sahip görevler)
      // Bu özel bir duruma göre ayarlanabilir
    }

    const gorevler = await Gorev.find(query)
      .populate("proje_id", "projeAdi")
      .populate("atananKisi_id", "ad soyad")
      .sort({ baslangicTarihi: -1 });

    res.json(gorevler);
  } catch (err) {
    logger.error("Tüm görevler getirilirken hata", { error: err.message });
    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/projeler/gorevler/all
// @desc    Tüm görevleri getir
// @access  Private
router.get("/gorevler/all", auth, async (req, res) => {
  try {
    const { includeGenelGorevler } = req.query;

    // Query oluştur
    let query = {};

    // includeGenelGorevler parametresi gelirse ek filtreler uygula
    if (includeGenelGorevler === "true") {
      // Özel filtre eklenebilir
      // Örneğin: Genel görevleri include etmek için bir koşul
    }

    // Tüm görevleri getir
    const gorevler = await Gorev.find(query)
      .populate("proje_id", "projeAdi")
      .populate("atananKisi_id", ["ad", "soyad"])
      .sort({ baslangicTarihi: -1 });

    return res.json(gorevler);
  } catch (err) {
    logger.error("Tüm görevleri getirme hatası", { error: err.message });
    return res.status(500).json({ msg: "Sunucu hatası" });
  }
});

// @route   GET api/projeler/gorevler/:id
// @desc    ID'ye göre görevi getir
// @access  Private
router.get("/gorevler/:id", auth, async (req, res) => {
  try {
    const gorev = await Gorev.findById(req.params.id)
      .populate("proje_id", "projeAdi")
      .populate("atananKisi_id", "ad soyad");

    if (!gorev) {
      return res.status(404).json({ msg: "Görev bulunamadı" });
    }

    res.json(gorev);
  } catch (err) {
    logger.error("Görev getirilirken hata", { error: err.message });

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Görev bulunamadı" });
    }

    res.status(500).send("Sunucu hatası");
  }
});

// @route   GET api/projeler/tum-gorevler
// @desc    Tüm görevleri getir - alternatif endpoint
// @access  Private
router.get("/tum-gorevler", auth, async (req, res) => {
  try {
    const { includeGenelGorevler } = req.query;

    let query = {};

    // Genel görevler için özel filtre eklenebilir
    if (includeGenelGorevler === "true") {
      // Örneğin: query.isGenel = true;
    }

    const gorevler = await Gorev.find(query)
      .populate("proje_id", "projeAdi")
      .populate("atananKisi_id", "ad soyad")
      .sort({ baslangicTarihi: -1 });

    res.json(gorevler);
  } catch (err) {
    logger.error("Tüm görevleri getirme hatası", { error: err.message });
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

module.exports = router;
