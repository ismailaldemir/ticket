const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Rol = sequelize.define(
  "Rol",
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "roller",
    timestamps: true,
    createdAt: "olusturmaTarihi",
    updatedAt: "sonGuncellemeTarihi",
  }
);

module.exports = Rol;
