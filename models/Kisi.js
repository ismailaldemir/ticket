const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Kisi = sequelize.define(
  "Kisi",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Kişisel Bilgiler
    tcKimlik: {
      type: DataTypes.STRING(11),
      allowNull: true,
    },
    ad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    soyad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    babaAdi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    anaAd: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dogumYeri: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dogumTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cinsiyet: {
      type: DataTypes.ENUM("Erkek", "Kadın"),
      allowNull: true,
    },
    medeniDurum: {
      type: DataTypes.ENUM("Bekar", "Evli", "Boşanmış", "Dul"),
      allowNull: true,
    },
    kanGrubu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Nüfus Bilgileri
    ciltNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aileSiraNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sayfaNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seriNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cuzdanNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verildigiYer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verilmeNedeni: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kayitNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verilmeTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Foreign Keys
    grup_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "groups",
        key: "id",
      },
    },
    aciklamalar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    dokumanlar: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "kisiler",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Kisi;
