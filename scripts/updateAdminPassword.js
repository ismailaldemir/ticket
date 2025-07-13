const sequelize = require("../config/database");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function updateAdminPassword() {
  try {
    console.log("PostgreSQL bağlantısı test ediliyor...");
    await sequelize.authenticate();
    console.log("PostgreSQL bağlantısı başarılı...");

    // Admin kullanıcısını bul
    const admin = await User.findOne({ where: { email: "admin@example.com" } });

    if (!admin) {
      console.log("Admin kullanıcısı bulunamadı!");
      process.exit(1);
    }

    console.log("Admin kullanıcısı bulundu:", admin.email);

    // Yeni şifreyi hashle
    const newPassword = "123456";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log("Yeni şifre hash'i oluşturuldu");

    // Şifreyi güncelle
    await admin.update({ password: hashedPassword });

    console.log("Admin şifresi başarıyla güncellendi!");

    // Test et
    const isMatch = await bcrypt.compare(newPassword, hashedPassword);
    console.log("Şifre testi:", isMatch ? "BAŞARILI" : "BAŞARISIZ");

    process.exit(0);
  } catch (err) {
    console.error("Hata:", err.message);
    process.exit(1);
  }
}

updateAdminPassword();
