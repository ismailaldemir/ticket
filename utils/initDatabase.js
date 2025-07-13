const { User, Rol, Yetki } = require("../models");
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
    let admin = await User.findOne({ where: { email: adminEmail } });

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

      console.log("Admin kullanıcısı oluşturuldu! ID:", admin.id);
    } else {
      console.log("Admin kullanıcısı bulundu! ID:", admin.id);
    }

    // 2. Admin rolünü kontrol et veya oluştur
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
      console.log("Admin rolü oluşturuldu! ID:", adminRol.id);
    } else {
      console.log("Admin rolü bulundu! ID:", adminRol.id);

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
      const mevcut = await Yetki.findOne({ where: { kod: yetkiData.kod } });
      if (!mevcut) {
        await Yetki.create(yetkiData);
        eklenenYetkiSayisi++;
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

    // Admin rolüne sadece permissions.json'daki kodlara sahip yetkileri ata
    const adminYetkiIdleri = tumYetkiler
      .filter((y) => permissions.some((p) => p.kod === y.kod))
      .map((y) => y.id);

    // Sequelize'da many-to-many ilişki için setYetkiler metodunu kullan
    await adminRol.setYetkiler(adminYetkiIdleri);
    console.log(
      `Admin rolüne atanan yetki sayısı: ${adminYetkiIdleri.length} / permissions.json: ${permissions.length}`
    );

    // 5. Admin kullanıcısına admin rolünü ata (Sequelize many-to-many ilişkisi)
    const adminRoller = await admin.getRoller();
    const hasAdminRole = adminRoller.some((rol) => rol.id === adminRol.id);

    if (!hasAdminRole) {
      try {
        await admin.addRol(adminRol);
        console.log("Admin kullanıcısına admin rolü başarıyla atandı!");
      } catch (error) {
        console.log("addRol metodu çalışmıyor, manuel olarak ekleniyor...");
        // Manuel olarak junction table'a insert yap
        const { UserRol } = require("../models/index");
        await UserRol.create({
          userId: admin.id,
          rolId: adminRol.id,
        });
        console.log("Admin kullanıcısına admin rolü manuel olarak atandı!");
      }
    } else {
      console.log("Admin kullanıcısı zaten admin rolüne sahip.");
    }

    // Admin kullanıcısını kontrol et
    const adminDetay = await User.findByPk(admin.id, {
      include: [
        {
          model: Rol,
          as: "roller",
          attributes: ["ad", "isAdmin"],
          include: [
            {
              model: Yetki,
              as: "yetkiler",
              attributes: ["kod", "ad", "modul", "islem"],
            },
          ],
        },
      ],
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
