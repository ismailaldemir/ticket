// Talep (Ticket) Modeli - Sequelize örneği
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Talep = sequelize.define('Talep', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  kaynak: { type: DataTypes.STRING(20), allowNull: false },
  proje_id: { type: DataTypes.INTEGER },
  sube_id: { type: DataTypes.INTEGER },
  talep_aciklama: { type: DataTypes.TEXT, allowNull: false },
  sla_id: { type: DataTypes.INTEGER },
  oncelik: { type: DataTypes.STRING(10), allowNull: false },
  durum: { type: DataTypes.STRING(20), defaultValue: 'açık' },
  kayit_tarihi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  bitis_tarihi: { type: DataTypes.DATE },
  atanan_user_id: { type: DataTypes.INTEGER },
  kategori_id: { type: DataTypes.INTEGER },
  etiketler: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  dosya: { type: DataTypes.TEXT },
  notlar: { type: DataTypes.TEXT },
  cozum: { type: DataTypes.TEXT },
  kapatma_tarihi: { type: DataTypes.DATE },
  guncelleme_tarihi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'talepler',
  timestamps: false,
});

module.exports = Talep;
