const express = require("express");
const router = express.Router();
const Cost = require("../database/costs"); // Cost model
const PriceChangeLog = require("../database/priceChangeLog"); // ✅ Fiyat log modeli

// GET: Tüm maliyetler
router.get("/", async (req, res) => {
  try {
    const costs = await Cost.find();
    res.json(costs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fiyat değişiklik loglarını listele (önce tanımlandı!)
router.get("/logs/all", async (req, res) => {
  try {
    const logs = await PriceChangeLog.find()
      .populate("productId", "productName productBarcode")
      .sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fiyat değişiklik logunu sil
router.delete("/logs/:id", async (req, res) => {
  try {
    const log = await PriceChangeLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Log bulunamadı" });
    }
    res.json({ message: "Log başarıyla silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Tek maliyet bilgisi (id ile)
router.get("/:id", async (req, res) => {
  try {
    const cost = await Cost.findById(req.params.id);
    if (!cost) {
      return res.status(404).json({ message: "Maliyet bulunamadı" });
    }
    res.json(cost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST: Yeni maliyet ekle
router.post("/", async (req, res) => {
  try {
    const newCost = new Cost(req.body);
    await newCost.save();
    res.status(201).json(newCost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Mevcut maliyeti güncelle + priceHistory + PriceChangeLog
router.put("/:id", async (req, res) => {
  try {
    const cost = await Cost.findById(req.params.id);
    if (!cost) return res.status(404).json({ message: "Maliyet bulunamadı" });

    const {
      productName,
      productBarcode,
      unitPrice,
      quantity,
      kdv,
      total,
      competitor,
      competitorPrice,
      competitorPriceDate,
      date,
      user,
    } = req.body;

    // 🔹 Değişiklikleri tespit et
    const changedFields = [];
    if (unitPrice !== undefined && unitPrice !== cost.unitPrice) {
      changedFields.push("Ürün Birim Fiyatı güncellendi");
      // ✅ PriceChangeLog’a ekle
      await PriceChangeLog.create({
        productId: cost._id,
        oldPrice: cost.unitPrice,
        newPrice: unitPrice,
        changeType: "unitPrice",
        user: user || "Unknown",
      });
    }
    if (quantity !== undefined && quantity !== cost.quantity)
      changedFields.push("Adet değişti");
    if (kdv !== undefined && kdv !== cost.kdv)
      changedFields.push("KDV değişti");
    if (total !== undefined && total !== cost.total)
      changedFields.push("Toplam değişti");
    if (competitorPrice !== undefined && competitorPrice !== cost.competitorPrice)
      changedFields.push("Rakip Fiyatı değişti");
    if (
      competitorPriceDate !== undefined &&
      String(competitorPriceDate) !== String(cost.competitorPriceDate)
    )
      changedFields.push("Rakip Fiyat Tarihi değişti");
    if (competitor !== undefined && competitor !== cost.competitor)
      changedFields.push("Rakip Firma değişti");
    if (productName !== undefined && productName !== cost.productName)
      changedFields.push("Ürün Adı değişti");
    if (productBarcode !== undefined && productBarcode !== cost.productBarcode)
      changedFields.push("Stok Kodu değişti");
    if (date !== undefined && String(date) !== String(cost.date))
      changedFields.push("Tarih değişti");

    // 🔹 PriceHistory’ye ekle
    cost.priceHistory.push({
      date: new Date(),
      productName,
      productBarcode,
      unitPrice,
      quantity,
      kdv,
      total,
      competitor,
      competitorPrice,
      competitorPriceDate,
      actionDetail:
        changedFields.length > 0
          ? changedFields.join(", ")
          : "Güncelleme yapıldı",
      user: user || "Unknown",
    });

    // Tüm alanları güncelle
    Object.assign(cost, req.body);
    const updatedCost = await cost.save();

    res.json(updatedCost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
