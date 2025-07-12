const fs = require("fs");
const path = require("path");

/**
 * CRM uygulaması için gerekli klasörleri kontrol eder ve oluşturur
 */
function checkAndCreateDirectories() {
  console.log("Klasör yapısı kontrolü başlatılıyor...");

  const baseDir = path.join(__dirname, "..");

  // Ana upload klasörü
  const uploadDir = path.join(baseDir, "uploads");
  ensureDirectoryExists(uploadDir);

  // Alt klasörler - evraklar, profil resimleri, dokuman tipleri vs.
  const subDirs = [
    path.join(uploadDir, "evraklar"),
    path.join(uploadDir, "profil"),
    path.join(uploadDir, "dokumanlar"),
    path.join(uploadDir, "temp"),
    path.join(uploadDir, "logs"),
  ];

  subDirs.forEach((dir) => ensureDirectoryExists(dir));

  // Güncel yıl ve ay için alt klasör
  const now = new Date();
  const yearDir = path.join(uploadDir, "evraklar", String(now.getFullYear()));
  ensureDirectoryExists(yearDir);

  const monthDir = path.join(
    yearDir,
    String(now.getMonth() + 1).padStart(2, "0")
  );
  ensureDirectoryExists(monthDir);

  console.log("Klasör yapısı kontrolü tamamlandı.");
}

/**
 * Klasörün var olup olmadığını kontrol eder, yoksa oluşturur
 * @param {string} dirPath - Oluşturulacak klasör yolu
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Klasör oluşturuldu: ${dirPath}`);
    } catch (err) {
      console.error(`Klasör oluşturma hatası (${dirPath}):`, err);
    }
  } else {
    console.log(`Klasör mevcut: ${dirPath}`);

    // Yazma izinlerini kontrol et
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      console.log(`Klasör yazılabilir: ${dirPath}`);
    } catch (err) {
      console.error(`Klasör yazılabilir değil (${dirPath}):`, err);
    }
  }
}

// Uygulama başlatıldığında çalıştır
checkAndCreateDirectories();

module.exports = { checkAndCreateDirectories, ensureDirectoryExists };
