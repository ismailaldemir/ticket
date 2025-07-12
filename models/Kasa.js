const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Kasa = sequelize.define(
  "Kasa",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sube_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subeler",
        key: "id",
      },
    },
    kasaAdi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sorumlu_uye_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "uyeler",
        key: "id",
      },
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "kasalar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
    indexes: [
      {
        unique: true,
        fields: ["sube_id", "kasaAdi"],
      },
    ],
  }
);

module.exports = Kasa;
