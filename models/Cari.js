const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cari = sequelize.define(
  "Cari",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cariAd: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adres: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    telefon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    webSitesi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    faxNumarasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    epostaAdresi: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    il: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ilce: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vergiDairesi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vergiNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cariTur: {
      type: DataTypes.ENUM(
        "Resmi Kurum",
        "Bağışçı",
        "Tedarikçi",
        "Müşteri",
        "Diğer"
      ),
      defaultValue: "Diğer",
    },
    cariTur_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "sabit_tanimlar",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "cariler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Cari;
