const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UyeRol = sequelize.define(
  "UyeRol",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ad: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aylikUcrettenMuaf: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "uye_roller",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = UyeRol;
