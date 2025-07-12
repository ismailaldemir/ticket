const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RolePermissionSchema = new Schema({
  role: { type: Schema.Types.ObjectId, ref: "rol", required: true },
  permission: { type: Schema.Types.ObjectId, ref: "Yetki", required: true },
  assignedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RolePermission", RolePermissionSchema);
