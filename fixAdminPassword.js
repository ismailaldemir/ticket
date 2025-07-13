const bcrypt = require("bcryptjs");
const sequelize = require("./config/database");
const User = require("./models/User");

async function fixAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL bağlantısı başarılı!");

    // Admin kullanıcısını bul
    const admin = await User.findOne({
      where: { email: "admin@example.com" },
    });

    if (!admin) {
      console.log("❌ Admin kullanıcısı bulunamadı!");
      return;
    }

    console.log("📋 Mevcut admin bilgileri:");
    console.log("- ID:", admin.id);
    console.log("- Email:", admin.email);
    console.log("- Mevcut hash:", admin.password);

    // Yeni şifre hash'i oluştur
    const plainPassword = "123456";
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(plainPassword, salt);

    console.log("\n🔄 Yeni hash oluşturuluyor...");
    console.log("- Yeni hash:", newHashedPassword);

    // Veritabanında güncelle
    await User.update(
      { password: newHashedPassword },
      { where: { email: "admin@example.com" } }
    );

    console.log("\n✅ Şifre veritabanında güncellendi!");

    // Doğrulama için tekrar çek
    const updatedAdmin = await User.findOne({
      where: { email: "admin@example.com" },
    });

    console.log("\n🔍 Güncellenmiş admin bilgileri:");
    console.log("- Email:", updatedAdmin.email);
    console.log("- Güncellenmiş hash:", updatedAdmin.password);

    // Test et
    const testResult = await bcrypt.compare(
      plainPassword,
      updatedAdmin.password
    );
    console.log(
      "\n🧪 Şifre testi:",
      testResult ? "✅ BAŞARILI" : "❌ BAŞARISIZ"
    );

    if (testResult) {
      console.log("\n🎉 Admin şifresi başarıyla düzeltildi!");
      console.log("   Email: admin@example.com");
      console.log("   Şifre: 123456");
    }

    await sequelize.close();
  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

fixAdminPassword();
