const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Yetki = sequelize.define(
  "Yetki",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    kod: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    modul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    islem: {
      type: DataTypes.ENUM(
        "goruntuleme",
        "ekleme",
        "duzenleme",
        "silme",
        "ozel"
      ),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "yetkiler",
    timestamps: true,
    createdAt: "olusturmaTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Yetki;
