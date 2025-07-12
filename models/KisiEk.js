const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KisiEk = sequelize.define(
  "KisiEk",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    referansId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    referansTur: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Kisi",
    },
    dosyaAdi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orijinalDosyaAdi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosyaYolu: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosyaBoyutu: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mimeTur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ekTur: {
      type: DataTypes.ENUM("Resim", "Belge", "Video", "Ses", "Diğer"),
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "kisi_ekleri",
    timestamps: true,
    createdAt: "yuklemeTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = KisiEk;
