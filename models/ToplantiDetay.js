const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ToplantiDetay = sequelize.define(
  "ToplantiDetay",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    toplanti_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "toplantilar",
        key: "id",
      },
    },
    kararNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    karar: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sorumlu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sonTarih: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    durumu: {
      type: DataTypes.ENUM(
        "Beklemede",
        "Devam Ediyor",
        "Tamamlandı",
        "İptal Edildi"
      ),
      defaultValue: "Beklemede",
    },
  },
  {
    tableName: "toplanti_detaylar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = ToplantiDetay;
