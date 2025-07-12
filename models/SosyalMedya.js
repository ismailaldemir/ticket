const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SosyalMedya = sequelize.define(
  "SosyalMedya",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tur: {
      type: DataTypes.ENUM(
        "Website",
        "Facebook",
        "Twitter",
        "Instagram",
        "LinkedIn",
        "YouTube",
        "TikTok",
        "Pinterest",
        "Snapchat",
        "Reddit",
        "Telegram",
        "WhatsApp",
        "Discord",
        "Diğer"
      ),
      allowNull: false,
      defaultValue: "Website",
    },
    url: {
      type: DataTypes.STRING,
    },
    kullaniciAdi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Kullanıcı adı zorunludur",
        },
      },
    },
    aciklama: {
      type: DataTypes.TEXT,
    },
    durumu: {
      type: DataTypes.ENUM("Aktif", "Pasif"),
      defaultValue: "Aktif",
    },
    referansId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    referansTur: {
      type: DataTypes.ENUM("Kisi", "Organizasyon"),
      allowNull: false,
    },
  },
  {
    tableName: "sosyal_medyalar",
    timestamps: true,
    indexes: [
      {
        fields: ["referansId", "referansTur"],
      },
      {
        fields: ["tur"],
      },
    ],
  }
);

module.exports = SosyalMedya;
