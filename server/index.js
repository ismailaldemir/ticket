const express = require("express");
const mongoose = require("mongoose");
const app = express();
const db = process.env.MONGO_URI || "mongodb://localhost:27017/iaidat";
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// Modelleri yükle
require("../models/Grup");
require("../models/Kisi");

// MongoDB bağlantısı
mongoose
  .connect(db, mongooseOptions)
  .then(() => console.log("MongoDB Bağlantısı başarılı"))
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

app.listen(3000, () => {
  console.log("Sunucu çalışıyor: http://localhost:3000");
});
