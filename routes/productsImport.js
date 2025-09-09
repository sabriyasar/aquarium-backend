const express = require("express");
const router = express.Router();
const Product = require("../database/products");

// POST: Excel’den gelen ürünleri kaydet
router.post("/", async (req, res) => {
  try {
    const products = req.body; // Excel JSON array
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Geçersiz veri formatı" });
    }

    const savedProducts = [];

    for (const item of products) {
      // Zorunlu alanları default verilerle doldur
      const productName = item["Akakçe Ürün Adı"] || "Bilinmiyor";
      const salePrice = parseFloat(item["Fiyatınız"] || 0);
      const productId = item.SKU || productName; // benzersiz ID olarak SKU veya isim

      // Mevcut ürün var mı kontrol et
      let existing = await Product.findOne({ productMainId: productId });

      if (existing) {
        // Fiyat değişimi hesapla
        const previousSalePrice = parseFloat(existing["Fiyatınız"] || 0);
        let priceChange = null;
        let priceDiff = salePrice - previousSalePrice;

        if (priceDiff > 0) priceChange = "up";
        else if (priceDiff < 0) priceChange = "down";
        else priceChange = "same";

        // Güncelle
        existing["Akakçe Ürün Adı"] = productName;
        existing["Akakçe Ürün Sayfası"] = item["Akakçe Ürün Sayfası"] || "";
        existing["Akakçe Kategori Adı"] = item["Akakçe Kategori Adı"] || "";
        existing["Marka"] = item["Marka"] || "";
        existing["En Ucuz Fiyat (Kargo Dahil)"] = parseFloat(item["En Ucuz Fiyat (Kargo Dahil)"] || 0);
        existing["Fiyatınız"] = salePrice;
        existing["Fiyatınız (Kargo Dahil)"] = parseFloat(item["Fiyatınız (Kargo Dahil)"] || 0);
        existing["Fark Oranı (%)"] = parseFloat(item["Fark Oranı (%)"] || 0);
        existing["Fark Tutarı (TL)"] = parseFloat(item["Fark Tutarı (TL)"] || 0);
        existing["Toplam Mağaza Sayısı"] = parseInt(item["Toplam Mağaza Sayısı"] || 0, 10);
        existing["SKU"] = item.SKU || "";
        existing["Satıcı Ürün Sayfası"] = item["Satıcı Ürün Sayfası"] || "";
        existing.importDate = new Date();
        existing.priceChange = priceChange;
        existing.priceDiff = Math.abs(priceDiff);

        await existing.save();
        savedProducts.push(existing);
      } else {
        // Yeni ürün ekle
        const newProduct = new Product({
          productMainId: productId,
          "Akakçe Ürün Adı": productName,
          "Akakçe Ürün Sayfası": item["Akakçe Ürün Sayfası"] || "",
          "Akakçe Kategori Adı": item["Akakçe Kategori Adı"] || "",
          "Marka": item["Marka"] || "",
          "En Ucuz Fiyat (Kargo Dahil)": parseFloat(item["En Ucuz Fiyat (Kargo Dahil)"] || 0),
          "Fiyatınız": salePrice,
          "Fiyatınız (Kargo Dahil)": parseFloat(item["Fiyatınız (Kargo Dahil)"] || 0),
          "Fark Oranı (%)": parseFloat(item["Fark Oranı (%)"] || 0),
          "Fark Tutarı (TL)": parseFloat(item["Fark Tutarı (TL)"] || 0),
          "Toplam Mağaza Sayısı": parseInt(item["Toplam Mağaza Sayısı"] || 0, 10),
          "SKU": item.SKU || "",
          "Satıcı Ürün Sayfası": item["Satıcı Ürün Sayfası"] || "",
          importDate: new Date(),
          priceChange: null,
          priceDiff: 0,
        });

        await newProduct.save();
        savedProducts.push(newProduct);
      }
    }

    res.json({
      message: "Ürünler başarıyla import edildi",
      data: savedProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
