const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GelirDetay = sequelize.define(
  "GelirDetay",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gelir_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "gelirler",
        key: "id",
      },
    },
    ucret_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ucretler",
        key: "id",
      },
    },
    miktar: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    birimFiyat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    toplamTutar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "gelir_detaylar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: false,
  }
);

module.exports = GelirDetay;
