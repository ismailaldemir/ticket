const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Uye = sequelize.define(
  "Uye",
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
    uyeRol_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "uye_roller",
        key: "id",
      },
    },
    uyeNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    sube_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subeler",
        key: "id",
      },
    },
    durumu: {
      type: DataTypes.ENUM("Aktif", "Pasif", "Askıda", "İptal"),
      defaultValue: "Aktif",
    },
    kayitKararNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    baslangicTarihi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    bitisTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "uyeler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Uye;
