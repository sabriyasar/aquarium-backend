const express = require("express");
const router = express.Router();
const Order = require("../database/order");

// 📌 Yeni sipariş oluştur
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    const totalAmount = items.reduce((acc, item) => {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      const kdv = Number(item.kdv || 0);
      const subtotal = price * qty;
      const totalItem = subtotal + (subtotal * kdv) / 100;
      return acc + totalItem;
    }, 0);

    const newOrder = new Order({
      ...req.body,
      totalAmount,
      status: req.body.status || "Onay bekliyor",
    });

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

// 📌 Sipariş güncelle
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Sipariş bulunamadı" });
    }

    res.json({ message: "Sipariş başarıyla güncellendi", order: updatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş güncellenemedi", error: err.message });
  }
});

module.exports = router;
