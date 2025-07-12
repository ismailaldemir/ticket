const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ucret = sequelize.define(
  "Ucret",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tutar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    birimUcret: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Birim fiyat x miktar olarak hesaplanacak",
    },
    aylikUcret: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Aylık olarak tahsil edilecek",
    },
    tarife_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tarifeler",
        key: "id",
      },
    },
    baslangicTarihi: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    bitisTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "ucretler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Ucret;
