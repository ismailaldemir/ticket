const mongoose = require("mongoose");
const config = require("config");
const User = require("../models/User");
const Rol = require("../models/Rol");
const Yetki = require("../models/Yetki");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Mongoose uyarısını bastır
mongoose.set("strictQuery", true);

// MongoDB bağlantısı
const db = config.get("mongoURI");

// Admin kullanıcısının bilgileri
const adminEmail = "admin@admin.com"; // Kendi admin e-postanızla değiştirin
const adminPassword = "123456"; // Güvenli bir şifre ile değiştirin
const adminName = "İsmail Aldemir";

async function setupAdmin() {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB bağlantısı başarılı...");

    // Admin kullanıcısını bul
    let admin = await User.findOne({ email: adminEmail });

    // Eğer admin kullanıcısı yoksa, oluştur
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
      console.log("Admin kullanıcısı oluşturuldu!");
    } else {
      console.log("Admin kullanıcısı bulundu!");
    }

    // Admin rolünü bul veya oluştur
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
      console.log("Admin rolü oluşturuldu!");
    } else {
      console.log("Admin rolü bulundu!");
    }

    // Yetkileri permissions.json'dan oku
    const permissionsPath = path.join(
      __dirname,
      "..",
      "client",
      "src",
      "constants",
      "permissions.json"
    );
    const permissionsRaw = fs.readFileSync(permissionsPath, "utf-8");
    const permissions = JSON.parse(permissionsRaw);

    // permissions.json'daki tüm yetkileri veritabanında kontrol et ve ekle
    let eklenenYetkiSayisi = 0;
    for (const yetkiData of permissions) {
      const mevcut = await Yetki.findOne({ kod: yetkiData.kod });
      if (!mevcut) {
        await new Yetki(yetkiData).save();
        eklenenYetkiSayisi++;
        console.log(`Yetki eklendi: ${yetkiData.kod}`);
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

    // Admin kullanıcısına admin rolünü ata
    admin.roller = [adminRol._id];
    await admin.save();

    console.log("Admin kullanıcısına admin rolü başarıyla atandı!");
    console.log("Kurulum tamamlandı: Admin e-posta:", adminEmail);
    console.log(
      "NOT: İlk girişten sonra admin şifresini değiştirmeyi unutmayın!"
    );

    // Oluşturulan kayıtları detaylı görüntüle
    console.log("\n--- Oluşturulan Kayıtlar ---");
    console.log("Admin Kullanıcı ID:", admin._id);
    console.log("Admin Rol ID:", adminRol._id);
    console.log("Oluşturulan Yetki Sayısı:", tumYetkiler.length);
    console.log("permissions.json Yetki Sayısı:", permissions.length);

    process.exit(0);
  } catch (err) {
    console.error("Hata:", err.message);

    // Daha detaylı hata bilgisi
    if (err.errors) {
      for (let field in err.errors) {
        console.error(
          `Validasyon hatası (${field}):`,
          err.errors[field].message
        );
      }
    }

    // MongoDB bağlantı hatalarını daha detaylı göster
    if (err.name === "MongoNetworkError") {
      console.error(
        "MongoDB bağlantısı sağlanamadı. Veritabanının çalıştığından emin olun."
      );
    }

    process.exit(1);
  }
}

setupAdmin();
