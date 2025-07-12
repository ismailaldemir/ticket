const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Abone = sequelize.define(
  "Abone",
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
    aboneTuru: {
      type: DataTypes.ENUM(
        "Mesken",
        "İşyeri",
        "Resmi Daire",
        "Tarım",
        "Ticarethane",
        "Sanayi",
        "Diğer"
      ),
      allowNull: false,
    },
    aboneNo: {
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
    durum: {
      type: DataTypes.ENUM("Aktif", "Pasif", "Askıda", "İptal"),
      defaultValue: "Aktif",
    },
    baslamaTarihi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    bitisTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    defterNo: {
      type: DataTypes.STRING,
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
    adres: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    telefonNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "aboneler",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Abone;
