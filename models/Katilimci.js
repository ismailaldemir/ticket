const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Katilimci = sequelize.define(
  "Katilimci",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    toplanti_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "toplantilar",
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
      type: DataTypes.ENUM("Katıldı", "Katılmadı", "Mazeretli"),
      defaultValue: "Katıldı",
    },
    gorev: {
      type: DataTypes.ENUM(
        "Başkan",
        "Sekreter",
        "Üye",
        "Gözlemci",
        "Davetli",
        "Diğer"
      ),
      defaultValue: "Üye",
    },
  },
  {
    tableName: "katilimcilar",
    timestamps: true,
    createdAt: "kayitTarihi",
    updatedAt: "guncellemeTarihi",
  }
);

module.exports = Katilimci;
