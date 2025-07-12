const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EvrakEk = sequelize.define(
  "EvrakEk",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    evrak_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "evraklar",
        key: "id",
      },
    },
    ekAdi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ekTur: {
      type: DataTypes.ENUM("Dosya", "Resim", "Video", "Ses", "Belge", "Diğer"),
      defaultValue: "Dosya",
    },
    dosyaYolu: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosyaBoyutu: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimeTur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orijinalDosyaAdi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sitedeyayimla: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "evrak_ekleri",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = EvrakEk;
