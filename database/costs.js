const mongoose = require("mongoose");

// Price history için alt schema
const priceHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  unitPrice: { type: Number },
  filamentCost: { type: Number },
  multiplePrintQty: { type: Number }, // ✅ bunu ekle
  multiplePrintUnitPrice: { type: Number },
  user: { type: String }, // değişikliği yapan kullanıcı
  actionDetail: { type: String }, // işlem detayı (ör: "Maliyet Güncellendi")
});

// Ana Cost schema
const costSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productBarcode: { type: String },
    filamentBrand: { type: String, required: true },
    filamentColor: { type: String, required: true },
    filamentCost: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    multiplePrintQty: { type: Number, required: true },
    multiplePrintUnitPrice: { type: Number, required: true },
    priceHistory: [priceHistorySchema], // price history array
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cost", costSchema);