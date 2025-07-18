require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const cors = require("cors");
const config = require("config");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const authRoutes = require("./routes/api/auth");
const userRoutes = require("./routes/api/users");
const kisiRoutes = require("./routes/api/kisiler");
const grupRoutes = require("./routes/api/gruplar");
const borcRoutes = require("./routes/api/borclar");
const odemeRoutes = require("./routes/api/odemeler");
const ucretRoutes = require("./routes/api/ucretler");
const { initializeAdmin } = require("./utils/initDatabase");

const app = express();

// Middleware
app.use(express.json({ extended: false }));

// Render.com veya farklı ortamlarda CORS'u dinamik olarak ayarlayın:
const allowedOrigins = [
  "http://localhost:5001",
  "http://localhost:5000",
  "http://localhost:3001", // Geliştirme ortamı için client adresi eklendi
  "http://localhost:3000", // Geliştirme ortamı için client adresi eklendi
    "https://iaidat-frontend.onrender.com", // Render.com'daki client URL'nizi buraya ekleyin
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman veya undefined origin için izin ver
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy hatası: " + origin), false);
    },
    credentials: true,
  })
);

// PostgreSQL Database connection and synchronization
sequelize
  .authenticate()
  .then(async () => {
    console.log("PostgreSQL veritabanı bağlantısı başarılı");

    // Veritabanı tablolarını senkronize et
    await sequelize.sync({ alter: false }); // alter: true yaparak mevcut tabloları güncelleyebilirsiniz
    console.log("PostgreSQL tabloları senkronize edildi");

    // Veritabanı başlangıç işlemlerini gerçekleştir
    try {
      await initializeAdmin();
      console.log("Sistem başlangıç kontrolleri tamamlandı");
    } catch (error) {
      console.error("Sistem başlangıç kontrollerinde hata:", error.message);
      // Kritik bir hata değilse uygulamayı durdurmuyoruz
    }
  })
  .catch((err) => {
    console.error("PostgreSQL veritabanı bağlantı hatası:", err);
    process.exit(1);
  });

// Uploads klasörlerini oluştur
const uploadsDir = path.join(__dirname, "uploads");
const kisilerDir = path.join(uploadsDir, "kisiler");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(kisilerDir)) {
  fs.mkdirSync(kisilerDir);
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dosya tipine göre hedef klasörü belirle
    let uploadPath = uploadsDir;
    if (req.baseUrl.includes("/kisiler")) {
      uploadPath = kisilerDir;
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: function (req, file, cb) {
    // İzin verilen dosya tipleri
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Geçersiz dosya tipi"), false);
    }
  },
});

// Uploads klasörünü statik olarak servis et
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/kisiler", require("./routes/api/kisiler"));
app.use("/api/gruplar", grupRoutes);
app.use("/api/borclar", borcRoutes);
app.use("/api/odemeler", odemeRoutes);
app.use("/api/ucretler", ucretRoutes);
// app.use("/api/raporlar", require("./routes/api/raporlar"));
app.use("/api/organizasyonlar", require("./routes/api/organizasyonlar"));
app.use("/api/subeler", require("./routes/api/subeler"));
app.use("/api/sabit-tanimlar", require("./routes/api/sabitTanimlar"));
app.use("/api/kasalar", require("./routes/api/kasalar"));
app.use("/api/cariler", require("./routes/api/cariler"));
app.use("/api/gelirler", require("./routes/api/gelirler"));
app.use("/api/giderler", require("./routes/api/giderler"));
app.use("/api/talepler", require("./routes/api/talepler"));
// app.use("/api/toplantilar", require("./routes/api/toplantilar"));
// app.use("/api/etkinlikler", require("./routes/api/etkinlikler"));
// app.use("/api/evraklar", require("./routes/api/evraklar"));
// app.use("/api/projeler", require("./routes/api/projeler"));
app.use("/api/aboneler", require("./routes/api/aboneler"));
// app.use("/api/abonedetaylar", require("./routes/api/abonedetaylar"));
// app.use("/api/iletisim", require("./routes/api/iletisim"));
app.use("/api/tarifeler", require("./routes/api/tarifeler"));
// app.use("/api/emails", require("./routes/api/emails"));
app.use("/api/sosyal-medya", require("./routes/api/sosyalMedya"));
app.use("/api/roller", require("./routes/api/roller"));
app.use("/api/yetkiler", require("./routes/api/yetkiler"));
app.use("/api/auditlogs", require("./routes/api/auditlogs"));
app.use("/api/uyeler", require("./routes/api/uyeler"));
// app.use("/api/email-listesi", require("./routes/api/emails"));
app.use("/api/status", require("./routes/api/status"));
// app.use("/api/randevu-slotlari", require("./routes/api/randevuSlotlari"));
// app.use("/api/randevu-tanimlari", require("./routes/api/randevuTanimlari"));
app.use("/api/health", require("./routes/api/health"));
app.use("/api/quick-actions", require("./routes/api/quickActionsRoutes"));

// Uploaded files serving
app.use("/uploads", express.static("uploads"));

// PORT'u dinamik olarak ayarla (Render için zorunlu)
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor - http://localhost:${port}`);
  console.log(
    `Yerel ağ üzerinden erişim için: http://<bilgisayarınızın-ip-adresi>:${port}`
  );
});
