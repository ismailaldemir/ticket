const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Gider = sequelize.define(
  "Gider",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    giderTuru: {
      type: DataTypes.ENUM(
        "Fatura Ödemeleri",
        "Şahıs Ödemeleri",
        "Kurum Ödemeleri",
        "Diğer"
      ),
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kasa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "kasalar",
        key: "id",
      },
    },
    tarih: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    belgeNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    giderYeri: {
      type: DataTypes.ENUM(
        "Gerçek Kişilere Borçlar",
        "Tüzel Kişilere Borçlar",
        "Diğer"
      ),
      defaultValue: "Diğer",
    },
    odemeTuru: {
      type: DataTypes.ENUM("Nakit", "Banka Hesabı", "Kredi Kartı", "Diğer"),
      defaultValue: "Nakit",
      allowNull: false,
    },
    toplamTutar: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    sonOdemeTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "giderler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Gider;
