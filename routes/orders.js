const express = require("express");
const router = express.Router();
const Order = require("../database/order");

// 📌 Yeni sipariş oluştur
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş oluşturulamadı", error: err.message });
  }
});

// 📌 Tüm siparişleri getir
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // en son eklenen en üstte
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Siparişler getirilemedi", error: err.message });
  }
});

// 📌 Sipariş sil
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Sipariş bulunamadı" });
    }

    res.json({ message: "Sipariş başarıyla silindi", order: deletedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş silinemedi", error: err.message });
  }
});

module.exports = router;
