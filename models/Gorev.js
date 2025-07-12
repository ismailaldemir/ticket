const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Görev şeması
const GorevSchema = new Schema({
  proje_id: {
    type: Schema.Types.ObjectId,
    ref: "proje",
    required: true,
  },
  gorevAdi: {
    type: String,
    required: true,
  },
  aciklama: {
    type: String,
  },
  atananKisi_id: {
    type: Schema.Types.ObjectId,
    ref: "kisi",
    default: null, // Null değere izin ver
  },
  // Görev türü ekleniyor
  gorevTuru: {
    type: String,
    enum: ["Proje", "Toplantı", "Etkinlik", "Bakım", "Diğer"],
    default: "Proje",
  },
  durumu: {
    type: String,
    enum: [
      "Yapılacak",
      "Devam Ediyor",
      "İncelemede",
      "Tamamlandı",
      "İptal Edildi",
    ],
    default: "Yapılacak",
  },
  oncelik: {
    type: String,
    enum: ["Düşük", "Orta", "Yüksek", "Kritik"],
    default: "Orta",
  },
  baslangicTarihi: {
    type: Date,
    default: Date.now,
  },
  bitisTarihi: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  kayitTarihi: {
    type: Date,
    default: Date.now,
  },
  tamamlanmaDurumu: {
    type: Number,
    default: 0, // Yüzde olarak tamamlanma durumu (0-100)
  },
  etiketler: {
    type: [String],
    default: [],
  },
});

module.exports = Gorev = mongoose.model("gorev", GorevSchema);
