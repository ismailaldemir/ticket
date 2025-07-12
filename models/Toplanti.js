const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Toplanti = sequelize.define(
  "Toplanti",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    toplantiTuru: {
      type: DataTypes.ENUM("Planlı Toplantı", "Olağanüstü Toplantı", "Diğer"),
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tarih: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    baslamaSaati: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bitisSaati: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    oturumNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toplantiYeri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gundem: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "toplantilar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Toplanti;
