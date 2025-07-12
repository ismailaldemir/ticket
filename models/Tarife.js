const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tarife = sequelize.define(
  "Tarife",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    kod: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    birimUcret: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Birim fiyat x miktar olarak hesaplanacak",
    },
    aylikUcret: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Aylık olarak tahsil edilecek",
    },
    // Hangi işlemlerde kullanılabilir
    kullanilabilecekAlanlar: {
      type: DataTypes.JSONB,
      defaultValue: {
        gelirler: true,
        giderler: false,
        borclar: true,
        odemeler: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "tarifeler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Tarife;
