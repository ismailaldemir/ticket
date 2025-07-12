const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RandevuSlot = sequelize.define(
  "RandevuSlot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    randevuTanimi_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "randevu_tanimlari",
        key: "id",
      },
    },
    tarih: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    baslangicZamani: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    bitisZamani: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    durum: {
      type: DataTypes.ENUM("Açık", "Kapalı", "Rezerve"),
      defaultValue: "Açık",
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kisi_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "kisiler",
        key: "id",
      },
    },
    cari_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "cariler",
        key: "id",
      },
    },
    notlar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    iptalNedeni: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    olusturanKullanici_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "randevu_slotlari",
    timestamps: true,
    indexes: [
      {
        fields: ["tarih"],
      },
      {
        fields: ["durum"],
      },
      {
        fields: ["tarih", "durum"],
      },
    ],
  }
);

module.exports = RandevuSlot;
