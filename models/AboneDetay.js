const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AboneDetay = sequelize.define(
  "AboneDetay",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    abone_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "aboneler",
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
    ilkTarih: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ilkEndeks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sonTarih: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sonEndeks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tuketim: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ucret_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "ucretler",
        key: "id",
      },
    },
    birimFiyat: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    toplamTutar: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    okuyankisi_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "kisiler",
        key: "id",
      },
    },
    durumu: {
      type: DataTypes.ENUM(
        "Okunmadı",
        "Okundu",
        "Fatura Kesildi",
        "Ödendi",
        "Devam Ediyor",
        "İptal"
      ),
      defaultValue: "Okunmadı",
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    odemeDetay: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    okunduMu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "abone_detaylar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
    indexes: [
      {
        unique: true,
        fields: ["abone_id", "yil", "ay"],
      },
    ],
  }
);

module.exports = AboneDetay;
