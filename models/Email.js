const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Email = sequelize.define(
  "Email",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    emailAdresi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Lütfen geçerli bir e-posta adresi giriniz",
        },
      },
      set(value) {
        this.setDataValue(
          "emailAdresi",
          value ? value.toLowerCase().trim() : value
        );
      },
    },
    referansTur: {
      type: DataTypes.ENUM("Kisi", "Organizasyon", "Sube"),
      allowNull: false,
    },
    referansId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tur: {
      type: DataTypes.ENUM(
        "Kişisel",
        "İş",
        "Bilgi",
        "Destek",
        "Genel",
        "Diğer"
      ),
      defaultValue: "İş",
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    varsayilan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    durumu: {
      type: DataTypes.ENUM("Aktif", "Pasif", "Doğrulanmamış"),
      defaultValue: "Aktif",
    },
    dogrulandi: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dogrulamaTarihi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "emails",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellenmeTarihi",
    indexes: [
      {
        fields: ["referansId", "referansTur"],
      },
      {
        fields: ["emailAdresi"],
      },
    ],
  }
);

// Pre-save hook to ensure only one default email per reference
Email.addHook("beforeCreate", async (email) => {
  if (email.varsayilan) {
    await Email.update(
      { varsayilan: false },
      {
        where: {
          referansId: email.referansId,
          referansTur: email.referansTur,
        },
      }
    );
  }
});

Email.addHook("beforeUpdate", async (email) => {
  if (email.changed("varsayilan") && email.varsayilan) {
    await Email.update(
      { varsayilan: false },
      {
        where: {
          referansId: email.referansId,
          referansTur: email.referansTur,
          id: { [sequelize.Sequelize.Op.ne]: email.id },
        },
      }
    );
  }
});

module.exports = Email;
