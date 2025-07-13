const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const QuickAction = sequelize.define(
  "QuickAction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    actions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Actions must be an array");
          }
        },
      },
    },
  },
  {
    tableName: "quick_actions",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id"],
      },
    ],
  }
);

module.exports = QuickAction;
