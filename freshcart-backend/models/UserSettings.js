const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true,
    },

    notifications: {
      orderUpdates: {
        type: Boolean,
        default: true,
      },

      promotions: {
        type: Boolean,
        default: true,
      },

      newProducts: {
        type: Boolean,
        default: true,
      },
    },

    appearance: {
      darkMode: {
        type: Boolean,
        default: false,
      },
    },

    language: {
      type: String,
      enum: ["en", "si"],
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.UserSettings ||
  mongoose.model("UserSettings", userSettingsSchema);

