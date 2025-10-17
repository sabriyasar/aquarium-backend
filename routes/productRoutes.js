const express = require("express");
const router = express.Router();
const Product = require("../database/products");

// GET: Tüm ürünler
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ importDate: -1 }).lean();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: Tek ürün
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ msg: "Ürün bulunamadı" });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// POST: Yeni ürün ekle
router.post("/", async (req, res) => {
  try {
    const { productName, productPrice, productBarcode, category, productImage } = req.body;

    if (!productName || !productPrice || !productBarcode) {
      return res.status(400).json({ error: "Ürün adı, fiyatı ve barkod zorunludur!" });
    }

    const existing = await Product.findOne({ productBarcode });
    if (existing) {
      return res.status(400).json({ error: "Bu barkoda sahip ürün zaten var!" });
    }

    const newProduct = new Product({
      productName,
      productPrice,
      productBarcode,
      category,
      productImage,
      sold: false, // yeni alan
    });

    await newProduct.save();
    res.json({ message: "Ürün başarıyla eklendi", data: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PUT: Ürün güncelle
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ msg: "Ürün bulunamadı" });
    res.json(updatedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Güncelleme sırasında hata oluştu" });
  }
});

// DELETE: Ürün sil
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ msg: "Ürün bulunamadı" });
    res.json({ message: "Ürün silindi", data: deletedProduct });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Silme sırasında hata oluştu" });
  }
});

module.exports = router;
