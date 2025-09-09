const express = require("express");
const router = express.Router();
const Cost = require("../database/costs"); // Model dosyası

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

// PUT: Mevcut maliyeti güncelle ve priceHistory ekle
router.put("/:id", async (req, res) => {
  try {
    const cost = await Cost.findById(req.params.id);
    if (!cost) return res.status(404).json({ message: "Maliyet bulunamadı" });

    const {
      productName,
      productBarcode,
      filamentBrand,
      filamentColor,
      filamentCost,
      unitPrice,
      multiplePrintQty,
      multiplePrintUnitPrice,
      user,
    } = req.body;

    // Değişiklikleri tespit et
    const changedFields = [];
    if (unitPrice !== undefined && unitPrice !== cost.unitPrice)
      changedFields.push("Ürün Birim Fiyatı güncellendi");
    if (filamentCost !== undefined && filamentCost !== cost.filamentCost)
      changedFields.push("Filament Ücreti değişti");
    if (multiplePrintUnitPrice !== undefined && multiplePrintUnitPrice !== cost.multiplePrintUnitPrice)
      changedFields.push("Çoklu Baskı Birim Fiyatı değişti");
    if (multiplePrintQty !== undefined && multiplePrintQty !== cost.multiplePrintQty)
      changedFields.push("Çoklu Baskı Adedi değişti");

    // Price history’ye yeni kayıt ekle
    cost.priceHistory.push({
      date: new Date(),
      productName,
      productBarcode,
      filamentBrand,
      filamentColor,
      filamentCost,
      unitPrice,
      multiplePrintQty,
      multiplePrintUnitPrice,
      actionDetail: changedFields.length > 0 ? changedFields.join(", ") : "Güncelleme yapıldı",
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
