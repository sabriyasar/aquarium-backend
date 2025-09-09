const mongoose = require("mongoose");

// Price history için alt schema
const priceHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  unitPrice: { type: Number },
  quantity: { type: Number },
  total: { type: Number },
  competitor: { type: String },
  competitorPrice: { type: Number },
  competitorPriceDate: { type: Date },
  user: { type: String }, // değişikliği yapan kullanıcı
  actionDetail: { type: String }, // işlem detayı (ör: "Maliyet Güncellendi")
});

// Ana Cost schema
const costSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productBarcode: { type: String }, // ✅ stok kodu alanı eklendi
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    competitor: { type: String, required: true },
    competitorPrice: { type: Number },
    competitorPriceDate: { type: Date },
    date: { type: Date, required: true },
    priceHistory: [priceHistorySchema], // price history array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cost", costSchema);
