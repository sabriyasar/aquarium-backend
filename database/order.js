const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Cost" }, // maliyet tablosuna referans
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
        // Yeni alanlar
        discount: { type: Number, default: 0 }, // % olarak
        competitorPrice: { type: Number, default: 0 },
        competitorPriceDate: { type: Date, default: null },
      },
    ],
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },

    // 📌 Yeni alan
    status: {
      type: String,
      enum: ["Taslak", "Onay bekliyor", "Onaylandı"],
      default: "Onay bekliyor",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
