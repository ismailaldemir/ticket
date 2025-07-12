const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EtkinlikKatilimci = sequelize.define(
  "EtkinlikKatilimci",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    etkinlik_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "etkinlikler",
        key: "id",
      },
    },
    kisi_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "kisiler",
        key: "id",
      },
    },
    katilimDurumu: {
      type: DataTypes.ENUM("Katılacak", "Katılmayacak", "Belki", "Katıldı"),
      defaultValue: "Katılacak",
    },
    not: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "etkinlik_katilimcilar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
    indexes: [
      {
        unique: true,
        fields: ["etkinlik_id", "kisi_id"],
      },
    ],
  }
);

module.exports = EtkinlikKatilimci;
