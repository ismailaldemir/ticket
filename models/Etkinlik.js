const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Etkinlik = sequelize.define(
  "Etkinlik",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizasyon_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "organizasyonlar",
        key: "id",
      },
    },
    etkinlikAdi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    etiketler: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    sorumlukisi_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "kisiler",
        key: "id",
      },
    },
    baslamaTarihi: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    bitisTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    baslamaSaati: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bitisSaati: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lokasyon: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    durumu: {
      type: DataTypes.ENUM(
        "Planlandı",
        "Devam Ediyor",
        "Tamamlandı",
        "İptal Edildi",
        "Ertelendi"
      ),
      defaultValue: "Planlandı",
    },
    maksimumKatilimci: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "etkinlikler",
    timestamps: true,
    createdAt: "olusturulmaTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Etkinlik;
