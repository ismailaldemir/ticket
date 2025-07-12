const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Telefon = sequelize.define(
  "Telefon",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    telefonNumarasi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Telefon numarası zorunludur",
        },
      },
    },
    tur: {
      type: DataTypes.ENUM("İş", "Cep", "Ev", "Faks", "WhatsApp", "Diğer"),
      defaultValue: "İş",
    },
    aciklama: {
      type: DataTypes.TEXT,
    },
    durumu: {
      type: DataTypes.ENUM("Aktif", "Pasif"),
      defaultValue: "Aktif",
    },
    referansId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    referansTur: {
      type: DataTypes.ENUM("Kisi", "Organizasyon"),
      allowNull: false,
    },
  },
  {
    tableName: "telefonlar",
    timestamps: true,
    indexes: [
      {
        fields: ["referansId", "referansTur"],
      },
      {
        fields: ["telefonNumarasi"],
      },
    ],
  }
);

module.exports = Telefon;
