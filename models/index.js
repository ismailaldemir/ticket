const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

// Import all models
const User = require("./User");
const Rol = require("./Rol");
const Yetki = require("./Yetki");
const Organizasyon = require("./Organizasyon");
const Kisi = require("./Kisi");
const Grup = require("./Grup");
const AuditLog = require("./AuditLog");
const Sube = require("./Sube");
const Adres = require("./Adres");

// Updated models (converted from MongoDB to PostgreSQL)
const Borc = require("./Borc");
const Odeme = require("./Odeme");
const Ucret = require("./Ucret");
const Kasa = require("./Kasa");
const Tarife = require("./Tarife");
const Cari = require("./Cari");
const SabitTanim = require("./SabitTanim");
const Uye = require("./Uye");
const UyeRol = require("./UyeRol");
const Gelir = require("./Gelir");
const Telefon = require("./Telefon");
const SosyalMedya = require("./SosyalMedya");
const Email = require("./Email");
const GelirDetay = require("./GelirDetay");
const Gider = require("./Gider");
const GiderDetay = require("./GiderDetay");
const Etkinlik = require("./Etkinlik");
const Abone = require("./Abone");
const AboneDetay = require("./AboneDetay");
const Evrak = require("./Evrak");
const EvrakEk = require("./EvrakEk");
const EtkinlikEk = require("./EtkinlikEk");
const EtkinlikKatilimci = require("./EtkinlikKatilimci");
const Toplanti = require("./Toplanti");
const ToplantiDetay = require("./ToplantiDetay");
const Katilimci = require("./Katilimci");
const Proje = require("./Proje");
const Dokuman = require("./Dokuman");
const KisiEk = require("./KisiEk");
const RandevuTanimi = require("./RandevuTanimi");
const RandevuSlot = require("./RandevuSlot");

// Models still to be converted
// const Gorev = require('./Gorev');

// Junction table for User-Rol many-to-many relationship
const UserRol = sequelize.define(
  "UserRol",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    rolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Rol,
        key: "id",
      },
    },
  },
  {
    tableName: "user_roles",
    timestamps: true,
    createdAt: "assignedAt",
    updatedAt: false,
  }
);

// Junction table for Rol-Yetki many-to-many relationship
const RolYetki = sequelize.define(
  "RolYetki",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Rol,
        key: "id",
      },
    },
    yetkiId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Yetki,
        key: "id",
      },
    },
  },
  {
    tableName: "rol_yetkiler",
    timestamps: false,
  }
);

// Define associations
// User - Rol (Many-to-Many)
User.belongsToMany(Rol, {
  through: UserRol,
  foreignKey: "userId",
  as: "roller",
});
Rol.belongsToMany(User, { through: UserRol, foreignKey: "rolId", as: "users" });

// Rol - Yetki (Many-to-Many)
Rol.belongsToMany(Yetki, {
  through: RolYetki,
  foreignKey: "rolId",
  as: "yetkiler",
});
Yetki.belongsToMany(Rol, {
  through: RolYetki,
  foreignKey: "yetkiId",
  as: "roller",
});

// Kisi - Grup (Many-to-One)
Kisi.belongsTo(Grup, { foreignKey: "grup_id", as: "grup" });
Grup.hasMany(Kisi, { foreignKey: "grup_id", as: "kisiler" });

// Sube - Organizasyon (Many-to-One)
Sube.belongsTo(Organizasyon, {
  foreignKey: "organizasyon_id",
  as: "organizasyon",
});
Organizasyon.hasMany(Sube, { foreignKey: "organizasyon_id", as: "subeler" });

// Adres - polymorphic association
Adres.belongsTo(Kisi, {
  foreignKey: "referansId",
  constraints: false,
  as: "kisi",
});
Adres.belongsTo(Organizasyon, {
  foreignKey: "referansId",
  constraints: false,
  as: "organizasyon",
});
Kisi.hasMany(Adres, {
  foreignKey: "referansId",
  constraints: false,
  as: "adresler",
});
Organizasyon.hasMany(Adres, {
  foreignKey: "referansId",
  constraints: false,
  as: "adresler",
});

// Updated associations for converted models
// Ucret - Tarife association
Ucret.belongsTo(Tarife, { foreignKey: "tarife_id", as: "tarife" });
Tarife.hasMany(Ucret, { foreignKey: "tarife_id", as: "ucretler" });

// Borc associations
Borc.belongsTo(Kisi, { foreignKey: "kisi_id", as: "kisi" });
Borc.belongsTo(Ucret, { foreignKey: "ucret_id", as: "ucret" });
Kisi.hasMany(Borc, { foreignKey: "kisi_id", as: "borclar" });
Ucret.hasMany(Borc, { foreignKey: "ucret_id", as: "borclar" });

// Kasa - Sube association
Kasa.belongsTo(Sube, { foreignKey: "sube_id", as: "sube" });
Kasa.belongsTo(Uye, { foreignKey: "sorumlu_uye_id", as: "sorumluUye" });
Sube.hasMany(Kasa, { foreignKey: "sube_id", as: "kasalar" });
Uye.hasMany(Kasa, { foreignKey: "sorumlu_uye_id", as: "sorumluOlduguKasalar" });

// Odeme associations
Odeme.belongsTo(Borc, { foreignKey: "borc_id", as: "borc" });
Odeme.belongsTo(Kisi, { foreignKey: "kisi_id", as: "kisi" });
Odeme.belongsTo(Kasa, { foreignKey: "kasa_id", as: "kasa" });
Borc.hasMany(Odeme, { foreignKey: "borc_id", as: "odemeler" });
Kisi.hasMany(Odeme, { foreignKey: "kisi_id", as: "odemeler" });
Kasa.hasMany(Odeme, { foreignKey: "kasa_id", as: "odemeler" });

// Gelir - Kasa association
Gelir.belongsTo(Kasa, { foreignKey: "kasa_id", as: "kasa" });
Kasa.hasMany(Gelir, { foreignKey: "kasa_id", as: "gelirler" });

// Uye associations
Uye.belongsTo(Kisi, { foreignKey: "kisi_id", as: "kisi" });
Uye.belongsTo(UyeRol, { foreignKey: "uyeRol_id", as: "uyeRol" });
Uye.belongsTo(Sube, { foreignKey: "sube_id", as: "sube" });
Kisi.hasMany(Uye, { foreignKey: "kisi_id", as: "uyeler" });
UyeRol.hasMany(Uye, { foreignKey: "uyeRol_id", as: "uyeler" });
Sube.hasMany(Uye, { foreignKey: "sube_id", as: "uyeler" });

// Cari - SabitTanim association
Cari.belongsTo(SabitTanim, {
  foreignKey: "cariTur_id",
  as: "cariTurSabitTanim",
});
SabitTanim.hasMany(Cari, { foreignKey: "cariTur_id", as: "cariler" });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: "user", as: "kullanici" });
User.hasMany(AuditLog, { foreignKey: "user", as: "auditLogs" });

module.exports = {
  sequelize,
  User,
  Rol,
  Yetki,
  UserRol,
  RolYetki,
  Organizasyon,
  Kisi,
  Grup,
  AuditLog,
  Sube,
  Adres,
  // Converted models
  Borc,
  Odeme,
  Ucret,
  Kasa,
  Tarife,
  Cari,
  SabitTanim,
  Uye,
  UyeRol,
  Gelir,
  Telefon,
  SosyalMedya,
  Email,
  GelirDetay,
  Gider,
  GiderDetay,
  Etkinlik,
  Abone,
  AboneDetay,
  Evrak,
  EvrakEk,
  EtkinlikEk,
  EtkinlikKatilimci,
  Toplanti,
  ToplantiDetay,
  Katilimci,
  Proje,
  Dokuman,
  KisiEk,
  RandevuTanimi,
  RandevuSlot,
};
