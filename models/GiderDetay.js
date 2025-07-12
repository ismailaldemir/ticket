const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GiderDetay = sequelize.define(
  "GiderDetay",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gider_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "giderler",
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
    tableName: "gider_detaylar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: false,
  }
);

module.exports = GiderDetay;
