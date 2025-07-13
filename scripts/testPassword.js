const bcrypt = require("bcryptjs");

// Veritabanında kayıtlı hash
const storedHash =
  "$2a$10$v.YOi2jGxagQd5spKDBds.09vxH2VciM0lFyy5Fhy8U4mtHR4BO9O";

// Test şifresi
const testPassword = "123456";

async function testPasswordHash() {
  try {
    console.log("Veritabanındaki hash:", storedHash);
    console.log("Test şifresi:", testPassword);

    // Şifre karşılaştırması
    const isMatch = await bcrypt.compare(testPassword, storedHash);
    console.log("Şifre eşleşiyor mu?", isMatch);

    // Yeni hash oluştur ve karşılaştır
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log("Yeni oluşturulan hash:", newHash);

    // Yeni hash ile karşılaştır
    const newMatch = await bcrypt.compare(testPassword, newHash);
    console.log("Yeni hash ile eşleşiyor mu?", newMatch);
  } catch (error) {
    console.error("Hata:", error);
  }
}

testPasswordHash();
