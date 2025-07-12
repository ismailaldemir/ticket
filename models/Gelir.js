const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Gelir = sequelize.define(
  "Gelir",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gelirTuru: {
      type: DataTypes.ENUM("Aidat", "Bağış", "Diğer"),
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kasa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "kasalar",
        key: "id",
      },
    },
    tarih: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    makbuzNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gelirYeri: {
      type: DataTypes.ENUM("Gerçek Kişi", "Tüzel Kişi", "Diğer"),
      defaultValue: "Gerçek Kişi",
    },
    tahsilatTuru: {
      type: DataTypes.ENUM("Nakit", "Kredi Kartı", "Havale/EFT", "Diğer"),
      allowNull: false,
      defaultValue: "Nakit",
    },
    toplamTutar: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "gelirler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Gelir;
