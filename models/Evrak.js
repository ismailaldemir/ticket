const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Evrak = sequelize.define(
  "Evrak",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    evrakTuru: {
      type: DataTypes.ENUM("Gelen Evrak", "Giden Evrak"),
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cari_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "cariler",
        key: "id",
      },
    },
    tarih: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    evrakNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    evrakKonusu: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gizlilikTuru: {
      type: DataTypes.ENUM("Kişiye Özel", "Çok Gizli", "Gizli", "Normal Evrak"),
      defaultValue: "Normal Evrak",
    },
    ilgiliKisi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    teslimTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    teslimAlan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "evraklar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Evrak;
