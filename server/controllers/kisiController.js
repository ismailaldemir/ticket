// Kişileri getirirken populate işlemlerini güncelle
exports.getKisiler = async (req, res) => {
  try {
    const kisiler = await Kisi.find()
      .populate("grup_id", "grupAdi")
      .populate("organizasyon_id", "ad")
      .populate("sube_id", "ad")
      .populate("rol_id", "ad")
      .sort({ ad: 1, soyad: 1 });

    res.json(kisiler);
  } catch (err) {
    res.status(500).json({ msg: "Sunucu hatası" });
  }
};

// Aktif kişileri getirirken populate işlemlerini güncelle
exports.getActiveKisiler = async (req, res) => {
  try {
    const kisiler = await Kisi.find({ isActive: true })
      .populate("grup_id", "grupAdi")
      .populate("organizasyon_id", "ad")
      .populate("sube_id", "ad")
      .populate("rol_id", "ad")
      .sort({ ad: 1, soyad: 1 });

    res.json(kisiler);
  } catch (err) {
    res.status(500).json({ msg: "Sunucu hatası" });
  }
};

// ID'ye göre kişi getirme işleminde populate işlemlerini güncelle
exports.getKisiById = async (req, res) => {
  try {
    const kisi = await Kisi.findById(req.params.id)
      .populate("grup_id", "grupAdi")
      .populate("organizasyon_id", "ad")
      .populate("sube_id", "ad")
      .populate("rol_id", "ad");

    if (!kisi) {
      return res.status(404).json({ msg: "Kişi bulunamadı" });
    }

    res.json(kisi);
  } catch (err) {
    res.status(500).json({ msg: "Sunucu hatası" });
  }
};

// Kişi ekleme işleminde organizasyon, şube ve rol alanlarını ekle
exports.addKisi = async (req, res) => {
  try {
    const {
      ad,
      soyad,
      tcKimlik,
      cinsiyet,
      dogumTarihi,
      dogumYeri,
      medeniDurum,
      kanGrubu,
      anaAd,
      babaAdi,
      telefonNumarasi,
      babasininTelefonNumarasi,
      nufusIl,
      nufusIlce,
      nufusMahalleKoy,
      ciltNo,
      aileSiraNo,
      sayfaNo,
      verilmeTarihi,
      verilmeNedeni,
      aciklamalar,
      dosyaNo,
      baslamaTarihi,
      bitisTarihi,
      email,
      adres,
      grup_id,
      isActive,
      organizasyon_id,
      sube_id,
      uyeRol_id,
    } = req.body;

    const yeniKisi = new Kisi({
      ad,
      soyad,
      tcKimlik,
      cinsiyet,
      dogumTarihi,
      dogumYeri,
      medeniDurum,
      kanGrubu,
      anaAd,
      babaAdi,
      telefonNumarasi,
      babasininTelefonNumarasi,
      nufusIl,
      nufusIlce,
      nufusMahalleKoy,
      ciltNo,
      aileSiraNo,
      sayfaNo,
      verilmeTarihi,
      verilmeNedeni,
      aciklamalar,
      dosyaNo,
      baslamaTarihi,
      bitisTarihi,
      email,
      adres,
      grup_id,
      isActive,
      organizasyon_id,
      sube_id,
      uyeRol_id,
    });

    await yeniKisi.save();
    res.json(yeniKisi);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Sunucu hatası" });
  }
};

// Kişi güncelleme işleminde organizasyon, şube ve rol alanlarını ekle
exports.updateKisi = async (req, res) => {
  try {
    const {
      ad,
      soyad,
      tcKimlik,
      cinsiyet,
      dogumTarihi,
      dogumYeri,
      medeniDurum,
      kanGrubu,
      anaAd,
      babaAdi,
      telefonNumarasi,
      babasininTelefonNumarasi,
      nufusIl,
      nufusIlce,
      nufusMahalleKoy,
      ciltNo,
      aileSiraNo,
      sayfaNo,
      verilmeTarihi,
      verilmeNedeni,
      aciklamalar,
      dosyaNo,
      baslamaTarihi,
      bitisTarihi,
      email,
      adres,
      grup_id,
      isActive,
      organizasyon_id,
      sube_id,
      uyeRol_id,
    } = req.body;

    const kisi = await Kisi.findById(req.params.id);
    if (!kisi) {
      return res.status(404).json({ msg: "Kişi bulunamadı" });
    }

    kisi.ad = ad;
    kisi.soyad = soyad;
    kisi.tcKimlik = tcKimlik;
    kisi.cinsiyet = cinsiyet;
    kisi.dogumTarihi = dogumTarihi;
    kisi.dogumYeri = dogumYeri;
    kisi.medeniDurum = medeniDurum;
    kisi.kanGrubu = kanGrubu;
    kisi.anaAd = anaAd;
    kisi.babaAdi = babaAdi;
    kisi.telefonNumarasi = telefonNumarasi;
    kisi.babasininTelefonNumarasi = babasininTelefonNumarasi;
    kisi.nufusIl = nufusIl;
    kisi.nufusIlce = nufusIlce;
    kisi.nufusMahalleKoy = nufusMahalleKoy;
    kisi.ciltNo = ciltNo;
    kisi.aileSiraNo = aileSiraNo;
    kisi.sayfaNo = sayfaNo;
    kisi.verilmeTarihi = verilmeTarihi;
    kisi.verilmeNedeni = verilmeNedeni;
    kisi.aciklamalar = aciklamalar;
    kisi.dosyaNo = dosyaNo;
    kisi.baslamaTarihi = baslamaTarihi;
    kisi.bitisTarihi = bitisTarihi;
    kisi.email = email;
    kisi.adres = adres;
    kisi.grup_id = grup_id;
    kisi.isActive = isActive;
    kisi.organizasyon_id = organizasyon_id;
    kisi.sube_id = sube_id;
    kisi.uyeRol_id = uyeRol_id;

    await kisi.save();
    res.json(kisi);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Sunucu hatası" });
  }
};
