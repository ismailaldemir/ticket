const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sube = sequelize.define(
  "Sube",
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
    organizasyon_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizasyonlar",
        key: "id",
      },
    },
    aciklama: {
      type: DataTypes.TEXT,
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
    tableName: "subeler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Sube;
