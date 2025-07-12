const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Adres = sequelize.define(
  "Adres",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adres: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    il: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ilce: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postaKodu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ulke: {
      type: DataTypes.STRING,
      defaultValue: "Türkiye",
    },
    tur: {
      type: DataTypes.ENUM("İş", "Ev", "Fatura", "Diğer"),
      defaultValue: "İş",
    },
    lokasyon: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    varsayilan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "adresler",
    timestamps: true,
    indexes: [
      {
        fields: ["referansId", "referansTur"],
      },
      {
        fields: ["il", "ilce"],
      },
    ],
  }
);

// Pre-save hook to ensure only one default address per reference
Adres.addHook("beforeCreate", async (adres) => {
  if (adres.varsayilan) {
    await Adres.update(
      { varsayilan: false },
      {
        where: {
          referansId: adres.referansId,
          referansTur: adres.referansTur,
        },
      }
    );
  }
});

Adres.addHook("beforeUpdate", async (adres) => {
  if (adres.changed("varsayilan") && adres.varsayilan) {
    await Adres.update(
      { varsayilan: false },
      {
        where: {
          referansId: adres.referansId,
          referansTur: adres.referansTur,
          id: { [sequelize.Sequelize.Op.ne]: adres.id },
        },
      }
    );
  }
});

module.exports = Adres;
