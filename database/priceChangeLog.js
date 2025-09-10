const mongoose = require("mongoose");

const priceChangeLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Cost", required: true },
  oldPrice: Number,
  newPrice: Number,
  changeType: String, // "unitPrice", "filamentCost", "multiplePrintUnitPrice"
  date: { type: Date, default: Date.now },
  user: { type: String, default: "Unknown" },
});

module.exports = mongoose.model("PriceChangeLog", priceChangeLogSchema);
