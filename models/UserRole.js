const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserRoleSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  role: { type: Schema.Types.ObjectId, ref: "rol", required: true },
  assignedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserRole", UserRoleSchema);
