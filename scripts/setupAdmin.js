const sequelize = require("../config/database");
const User = require("../models/User");
const Rol = require("../models/Rol");
const Yetki = require("../models/Yetki");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Admin kullanıcısının bilgileri
const adminEmail = "admin@example.com"; // config'den gelecek
const adminPassword = "123456"; // config'den gelecek
const adminName = "Admin Kullanıcı"; // config'den gelecek

async function setupAdmin() {
  try {
    console.log("PostgreSQL bağlantısı test ediliyor...");
    await sequelize.authenticate();
    console.log("PostgreSQL bağlantısı başarılı...");

    // Admin kullanıcısını bul
    let admin = await User.findOne({ where: { email: adminEmail } });

    // Eğer admin kullanıcısı yoksa, oluştur
    if (!admin) {
      console.log("Admin kullanıcısı bulunamadı, oluşturuluyor...");

      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        active: true,
      });

      console.log("Admin kullanıcısı oluşturuldu!");
    } else {
      console.log("Admin kullanıcısı bulundu!");
    }

    // Admin rolünü bul veya oluştur
    let adminRol = await Rol.findOne({ where: { ad: "Admin" } });

    if (!adminRol) {
      console.log("Admin rolü bulunamadı, oluşturuluyor...");
      adminRol = await Rol.create({
        ad: "Admin",
        aciklama: "Sistem yöneticisi rolü",
        isAdmin: true,
        isDefault: false,
        isActive: true,
      });
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
      const mevcut = await Yetki.findOne({ where: { kod: yetkiData.kod } });
      if (!mevcut) {
        await Yetki.create(yetkiData);
        eklenenYetkiSayisi++;
        console.log(`Yetki eklendi: ${yetkiData.kod}`);
      }
    }

    // Tüm yetkileri tekrar çek (güncel ve eksiksiz)
    const tumYetkiler = await Yetki.findAll();
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

    console.log(`Toplam yetki sayısı: ${tumYetkiler.length}`);
    console.log(`Admin rolü ID: ${adminRol.id}`);
    console.log(`Admin kullanıcı ID: ${admin.id}`);

    console.log("Admin kullanıcısına admin rolü başarıyla atandı!");
    console.log("Kurulum tamamlandı: Admin e-posta:", adminEmail);
    console.log(
      "NOT: İlk girişten sonra admin şifresini değiştirmeyi unutmayın!"
    );

    // Oluşturulan kayıtları detaylı görüntüle
    console.log("\n--- Oluşturulan Kayıtlar ---");
    console.log("Admin Kullanıcı ID:", admin.id);
    console.log("Admin Rol ID:", adminRol.id);
    console.log("Oluşturulan Yetki Sayısı:", tumYetkiler.length);
    console.log("permissions.json Yetki Sayısı:", permissions.length);

    process.exit(0);
  } catch (err) {
    console.error("Hata:", err.message);

    // Daha detaylı hata bilgisi
    if (err.errors) {
      console.error("Sequelize validation errors:", err.errors);
    }

    process.exit(1);
  }
}

setupAdmin();
