const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dokuman = sequelize.define(
  "Dokuman",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    referansId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    referansTur: {
      type: DataTypes.ENUM(
        "Kisi",
        "Etkinlik",
        "Toplanti",
        "Proje",
        "Organizasyon"
      ),
      allowNull: false,
    },
    dosyaAdi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orijinalDosyaAdi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dosyaYolu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dosyaBoyutu: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimeTur: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ekTur: {
      type: DataTypes.ENUM("Resim", "Belge", "Video", "Ses", "Diğer"),
      defaultValue: "Diğer",
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    etiketler: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    yukleyenId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "dokumanlar",
    timestamps: true,
    createdAt: "yuklemeTarihi",
    updatedAt: false,
    indexes: [
      {
        fields: ["referansId", "referansTur"],
      },
    ],
  }
);

module.exports = Dokuman;
