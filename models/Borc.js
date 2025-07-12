const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Borc = sequelize.define(
  "Borc",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    kisi_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "kisiler",
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
    yil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ay: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    borclandirmaTarihi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    borcTutari: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    miktar: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    kalan: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    odendi: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sonOdemeTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "borclar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
    hooks: {
      beforeCreate: (borc) => {
        if (borc.kalan === null || borc.kalan === undefined) {
          borc.kalan = borc.borcTutari;
        }
      },
    },
  }
);

module.exports = Borc;
