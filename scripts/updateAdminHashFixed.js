const bcrypt = require("bcryptjs");
const sequelize = require("./config/database");
const User = require("./models/User");

async function updateAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL bağlantısı başarılı!");

    // Doğru şifre hash'ini oluştur
    const plainPassword = "123456";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    console.log("Oluşturulan yeni hash:", hashedPassword);

    // Admin kullanıcısını bul ve şifresini güncelle
    const admin = await User.findOne({
      where: { email: "admin@example.com" },
    });

    if (admin) {
      await admin.update({ password: hashedPassword });
      console.log("✅ Admin şifresi başarıyla güncellendi!");

      // Test et
      const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
      console.log("✅ Şifre testi:", testMatch ? "BAŞARILI" : "BAŞARISIZ");
    } else {
      console.log("❌ Admin kullanıcısı bulunamadı!");
    }

    await sequelize.close();
  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

updateAdminPassword();
