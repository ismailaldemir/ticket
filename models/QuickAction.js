const mongoose = require("mongoose");

const QuickActionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // düzeltildi
    required: true,
  },
  actions: [
    {
      id: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
      },
      path: {
        type: String,
        required: true,
      },
      permission: {
        type: String,
      },
      color: {
        type: String,
        default: "primary",
      },
      description: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("QuickAction", QuickActionSchema);
