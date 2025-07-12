const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RandevuTanimi = sequelize.define(
  "RandevuTanimi",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aciklama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gunler: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      validate: {
        isValidDays(value) {
          if (!value || value.length === 0) {
            throw new Error("En az bir gün seçilmeli");
          }
          if (!value.every((gun) => gun >= 0 && gun <= 6)) {
            throw new Error(
              "Günler 0-6 aralığında olmalıdır (0: Pazar, 6: Cumartesi)"
            );
          }
        },
      },
    },
    baslangicSaati: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "Başlangıç saati geçerli bir saat olmalıdır (HH:MM)",
        },
      },
    },
    bitisSaati: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "Bitiş saati geçerli bir saat olmalıdır (HH:MM)",
        },
      },
    },
    slotSuresiDk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 5,
          msg: "Slot süresi en az 5 dakika olmalıdır",
        },
        max: {
          args: 240,
          msg: "Slot süresi en fazla 240 dakika olmalıdır",
        },
      },
    },
    maksimumKisi: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: {
          args: 1,
          msg: "Her slotta en az 1 kişi olmalıdır",
        },
      },
    },
    lokasyon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    olusturanKullanici_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "randevu_tanimlari",
    timestamps: true,
  }
);

module.exports = RandevuTanimi;
