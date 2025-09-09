const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productMainId: { type: String, required: true, unique: true },

    // Frontend başlıklarıyla birebir eşleşen alanlar
    "Akakçe Ürün Adı": { type: String, required: true },
    "Akakçe Ürün Sayfası": { type: String, default: "" },
    "Akakçe Kategori Adı": { type: String, default: "" },
    "Marka": { type: String, default: "" },
    "En Ucuz Fiyat (Kargo Dahil)": { type: Number, default: 0 },
    "Fiyatınız": { type: Number, default: 0 },
    "Fiyatınız (Kargo Dahil)": { type: Number, default: 0 },
    "Fark Oranı (%)": { type: Number, default: 0 },
    "Fark Tutarı (TL)": { type: Number, default: 0 },
    "Toplam Mağaza Sayısı": { type: Number, default: 0 },
    "SKU": { type: String, default: "" },
    "Satıcı Ürün Sayfası": { type: String, default: "" },

    importDate: { type: Date, default: Date.now },

    // Fiyat değişimi için alanlar
    previousSalePrice: { type: Number, default: null },
    priceChange: {
      type: String,
      enum: ["up", "down", "same", null],
      default: null,
    },
    priceDiff: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
