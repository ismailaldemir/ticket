const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Proje = sequelize.define(
  "Proje",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projeAdi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    baslamaTarihi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    bitisTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    durumu: {
      type: DataTypes.ENUM(
        "Planlandı",
        "Devam Ediyor",
        "Tamamlandı",
        "İptal Edildi",
        "Durduruldu",
        "Askıya Alındı"
      ),
      defaultValue: "Planlandı",
    },
    oncelik: {
      type: DataTypes.ENUM("Düşük", "Orta", "Yüksek", "Kritik"),
      defaultValue: "Orta",
    },
    sorumluKisi_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "kisiler",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tamamlanmaDurumu: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    etiketler: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    tableName: "projeler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Proje;
