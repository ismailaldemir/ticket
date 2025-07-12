const User = require("../models/User");
const Rol = require("../models/Rol");
const Yetki = require("../models/Yetki");
const bcrypt = require("bcryptjs");
const config = require("config");
const fs = require("fs");
const path = require("path");

/**
 * Sistem başlatıldığında admin kullanıcısını ve gerekli yetkileri kontrol edip oluşturan fonksiyon
 */
const initializeAdmin = async () => {
  // Admin kullanıcı bilgileri - config'den alma
  const adminEmail = config.get("adminEmail") || "admin@example.com";
  const adminPassword = config.get("adminPassword") || "admin123456";
  const adminName = config.get("adminName") || "Admin Kullanıcı";

  try {
    console.log("Admin kullanıcısı ve yetkileri kontrol ediliyor...");

    // 1. Admin kullanıcısını kontrol et veya oluştur
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log("Admin kullanıcısı bulunamadı, oluşturuluyor...");

      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        active: true,
      });

      await admin.save();
      console.log("Admin kullanıcısı oluşturuldu! ID:", admin._id);
    } else {
      console.log("Admin kullanıcısı bulundu! ID:", admin._id);
    }

    // 2. Admin rolünü kontrol et veya oluştur
    let adminRol = await Rol.findOne({ ad: "Admin" });

    if (!adminRol) {
      console.log("Admin rolü bulunamadı, oluşturuluyor...");
      adminRol = new Rol({
        ad: "Admin",
        aciklama: "Sistem yöneticisi rolü",
        isAdmin: true,
        isDefault: false,
        isActive: true,
      });
      await adminRol.save();
      console.log("Admin rolü oluşturuldu! ID:", adminRol._id);
    } else {
      console.log("Admin rolü bulundu! ID:", adminRol._id);

      // Admin rolünün isAdmin özelliğini doğrula
      if (!adminRol.isAdmin) {
        adminRol.isAdmin = true;
        await adminRol.save();
        console.log("Admin rolünün isAdmin özelliği true olarak güncellendi!");
      }
    }

    // --- YENİ: permissions.json'dan yetkileri oku ve eksiksiz ekle ---
    const permissionsPath = path.join(
      __dirname,
      "..",
      "client",
      "src",
      "constants",
      "permissions.json"
    );
    let permissions = [];
    if (fs.existsSync(permissionsPath)) {
      const permissionsRaw = fs.readFileSync(permissionsPath, "utf-8");
      permissions = JSON.parse(permissionsRaw);
    } else {
      throw new Error("permissions.json dosyası bulunamadı!");
    }

    // permissions.json'daki tüm yetkileri veritabanında kontrol et ve ekle
    let eklenenYetkiSayisi = 0;
    for (const yetkiData of permissions) {
      const mevcut = await Yetki.findOne({ kod: yetkiData.kod });
      if (!mevcut) {
        await new Yetki(yetkiData).save();
        eklenenYetkiSayisi++;
      }
    }

    // Tüm yetkileri tekrar çek (güncel ve eksiksiz)
    const tumYetkiler = await Yetki.find();
    // permissions.json'daki kodlar ile veritabanındaki kodları karşılaştır
    const tumYetkiKodlari = tumYetkiler.map((y) => y.kod);
    const eksikKodlar = permissions
      .map((p) => p.kod)
      .filter((kod) => !tumYetkiKodlari.includes(kod));
    if (eksikKodlar.length > 0) {
      console.warn(
        `Dikkat: Aşağıdaki yetkiler veritabanında eksik kaldı: ${eksikKodlar.join(
          ", "
        )}`
      );
    }

    // Admin rolüne sadece permissions.json'daki kodlara sahip yetkileri ata
    const adminYetkiIdleri = tumYetkiler
      .filter((y) => permissions.some((p) => p.kod === y.kod))
      .map((y) => y._id);

    adminRol.yetkiler = adminYetkiIdleri;
    await adminRol.save();
    console.log(
      `Admin rolüne atanan yetki sayısı: ${adminRol.yetkiler.length} / permissions.json: ${permissions.length}`
    );

    // 5. Admin kullanıcısına admin rolünü ata
    if (!admin.roller || !Array.isArray(admin.roller)) {
      admin.roller = [];
    }

    if (
      !admin.roller.find((rol) => rol.toString() === adminRol._id.toString())
    ) {
      admin.roller.push(adminRol._id);
      await admin.save();
      console.log("Admin kullanıcısına admin rolü başarıyla atandı!");
    } else {
      console.log("Admin kullanıcısı zaten admin rolüne sahip.");
    }

    // Admin kullanıcısını kontrol et
    const adminDetay = await User.findById(admin._id).populate({
      path: "roller",
      select: "ad isAdmin yetkiler",
      populate: {
        path: "yetkiler",
        select: "kod ad modul islem",
      },
    });

    console.log("Admin kullanıcısı detayları:");
    console.log("- Adı:", adminDetay.name);
    console.log("- E-posta:", adminDetay.email);
    console.log(
      "- Rol sayısı:",
      adminDetay.roller ? adminDetay.roller.length : 0
    );

    if (adminDetay.roller && adminDetay.roller.length > 0) {
      adminDetay.roller.forEach((rol) => {
        console.log(`- Rol: ${rol.ad} (isAdmin: ${rol.isAdmin})`);
        console.log(
          `  - Yetki sayısı: ${rol.yetkiler ? rol.yetkiler.length : 0}`
        );
      });
    }

    // Model adını detaylı bir şekilde yazdıralım:
    console.log("Yetki modelinin adı:", Yetki.modelName);

    return true;
  } catch (error) {
    console.error("Admin başlangıç ayarlamasında hata:", error.message);

    // Detaylı hata mesajları
    if (error.errors) {
      for (let field in error.errors) {
        console.error(
          `Validasyon hatası (${field}):`,
          error.errors[field].message
        );
      }
    }

    throw error;
  }
};

module.exports = {
  initializeAdmin,
};
