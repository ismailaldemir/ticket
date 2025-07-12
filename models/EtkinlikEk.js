const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EtkinlikEk = sequelize.define(
  "EtkinlikEk",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    etkinlik_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "etkinlikler",
        key: "id",
      },
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
      type: DataTypes.ENUM("Resim", "Belge", "Diğer"),
      defaultValue: "Diğer",
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
    tableName: "etkinlik_ekleri",
    timestamps: true,
    createdAt: "yuklemeTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = EtkinlikEk;
