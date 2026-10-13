const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
  },
  {
    timestamps: true,
  }
);

// Same user cannot favorite same product twice
favoriteSchema.index(
  {
    userId: 1,
    productId: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.models.Favorite ||
  mongoose.model("Favorite", favoriteSchema);