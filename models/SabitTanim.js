const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SabitTanim = sequelize.define(
  "SabitTanim",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deger: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "sabit_tanimlar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
    indexes: [
      {
        unique: true,
        fields: ["tip", "kod"],
      },
    ],
  }
);

module.exports = SabitTanim;
