const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productBarcode: { type: String, required: true, unique: true },
  category: { type: String, default: "" },
  productImage: { type: String, default: "" },
  sold: { type: Boolean, default: false }, // yeni alan
  importDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
