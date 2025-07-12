const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "timestamp",
    updatedAt: false,
  }
);

module.exports = AuditLog;
