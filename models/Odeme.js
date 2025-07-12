const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Odeme = sequelize.define(
  "Odeme",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    borc_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "borclar",
        key: "id",
      },
    },
    kisi_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "kisiler",
        key: "id",
      },
    },
    kasa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "kasalar",
        key: "id",
      },
    },
    odemeTarihi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    odemeTutari: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    odemeYontemi: {
      type: DataTypes.ENUM("Nakit", "Havale/EFT", "Kredi Kartı", "Diğer"),
      defaultValue: "Nakit",
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    makbuzNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Dekont dosyası için alanlar
    dekontDosyaAdi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dekontOrijinalAd: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dekontMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dekontBoyut: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "odemeler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Odeme;
