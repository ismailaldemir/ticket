const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Organizasyon = sequelize.define(
  "Organizasyon",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    misyon: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vizyon: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hakkinda: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kurulusTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gorselBilgileri: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    lokasyon: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    iletisimBilgileri: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "organizasyonlar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Organizasyon;
