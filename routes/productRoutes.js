const express = require("express");
const router = express.Router();
const Product = require("../database/products");

// GET: Tüm ürünler
router.get("/", async (req, res) => {
  console.log("📡 GET /api/products çağrıldı");
  try {
    // importDate göre en son eklenen ilk sırada olacak şekilde sırala
    const products = await Product.find().sort({ importDate: -1 }).lean();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: Tek ürün
router.get("/:id", async (req, res) => {
  console.log(`📡 GET /api/products/${req.params.id} çağrıldı`);
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ msg: "Ürün bulunamadı" });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// POST: Excel import veya yeni ürün ekle
router.post("/", async (req, res) => {
  console.log("📡 POST /api/products çağrıldı", req.body);

  try {
    const products = req.body; // Excel JSON array bekleniyor
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Geçersiz veri formatı" });
    }

    const result = [];

    for (const row of products) {
      // Benzersiz ID: varsa productMainId, yoksa SKU
      const mainId = row.productMainId || row.SKU || row["Akakçe Ürün Adı"];

      const existing = await Product.findOne({ productMainId: mainId });

      const newSalePrice = parseFloat(row["Fiyatınız"] || row.salePrice || 0);
      let priceChange = null;
      let priceDiff = 0;

      if (existing) {
        const previousSalePrice = parseFloat(existing["Fiyatınız"] || existing.salePrice || 0);
        priceDiff = newSalePrice - previousSalePrice;

        if (priceDiff > 0) priceChange = "up";
        else if (priceDiff < 0) priceChange = "down";
        else priceChange = "same";

        // Güncelleme: frontend başlıklarıyla
        Object.assign(existing, {
          productMainId: mainId,
          "Akakçe Ürün Adı": row["Akakçe Ürün Adı"] || existing["Akakçe Ürün Adı"],
          "Akakçe Ürün Sayfası": row["Akakçe Ürün Sayfası"] || existing["Akakçe Ürün Sayfası"] || "",
          "Akakçe Kategori Adı": row["Akakçe Kategori Adı"] || existing["Akakçe Kategori Adı"] || "",
          "Marka": row["Marka"] || existing["Marka"] || "",
          "En Ucuz Fiyat (Kargo Dahil)": parseFloat(row["En Ucuz Fiyat (Kargo Dahil)"] || existing["En Ucuz Fiyat (Kargo Dahil)"] || 0),
          "Fiyatınız": newSalePrice,
          "Fiyatınız (Kargo Dahil)": parseFloat(row["Fiyatınız (Kargo Dahil)"] || existing["Fiyatınız (Kargo Dahil)"] || 0),
          "Fark Oranı (%)": parseFloat(row["Fark Oranı (%)"] || existing["Fark Oranı (%)"] || 0),
          "Fark Tutarı (TL)": parseFloat(row["Fark Tutarı (TL)"] || existing["Fark Tutarı (TL)"] || 0),
          "Toplam Mağaza Sayısı": parseInt(row["Toplam Mağaza Sayısı"] || existing["Toplam Mağaza Sayısı"] || 0, 10),
          "SKU": row["SKU"] || existing["SKU"] || "",
          "Satıcı Ürün Sayfası": row["Satıcı Ürün Sayfası"] || existing["Satıcı Ürün Sayfası"] || "",
          importDate: new Date(),
          priceChange,
          priceDiff: Math.abs(priceDiff),
        });

        await existing.save();
        result.push(existing.toObject());
      } else {
        // Yeni ürün ekle
        const newProduct = new Product({
          productMainId: mainId,
          "Akakçe Ürün Adı": row["Akakçe Ürün Adı"] || "",
          "Akakçe Ürün Sayfası": row["Akakçe Ürün Sayfası"] || "",
          "Akakçe Kategori Adı": row["Akakçe Kategori Adı"] || "",
          "Marka": row["Marka"] || "",
          "En Ucuz Fiyat (Kargo Dahil)": parseFloat(row["En Ucuz Fiyat (Kargo Dahil)"] || 0),
          "Fiyatınız": newSalePrice,
          "Fiyatınız (Kargo Dahil)": parseFloat(row["Fiyatınız (Kargo Dahil)"] || 0),
          "Fark Oranı (%)": parseFloat(row["Fark Oranı (%)"] || 0),
          "Fark Tutarı (TL)": parseFloat(row["Fark Tutarı (TL)"] || 0),
          "Toplam Mağaza Sayısı": parseInt(row["Toplam Mağaza Sayısı"] || 0, 10),
          "SKU": row["SKU"] || "",
          "Satıcı Ürün Sayfası": row["Satıcı Ürün Sayfası"] || "",
          importDate: new Date(),
          priceChange: null,
          priceDiff: 0,
        });

        await newProduct.save();
        result.push(newProduct.toObject());
      }
    }

    res.json({ message: "Ürünler başarıyla import edildi", data: result });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PUT: Ürün güncelle
router.put("/:id", async (req, res) => {
  console.log(`📡 PUT /api/products/${req.params.id} çağrıldı`, req.body);
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
  console.log(`📡 DELETE /api/products/${req.params.id} çağrıldı`);
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
