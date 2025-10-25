const express = require("express");
const router = express.Router();

// Basit normalize fonksiyonu
function normalizeBarcode(barcode) {
  if (!barcode) return "";
  // Tüm boşlukları kaldır
  let normalized = barcode.replace(/\s+/g, "");
  // Sadece rakamları veya harfleri al (CODE-128 destek için)
  normalized = normalized.replace(/[^0-9A-Za-z]/g, "");
  return normalized;
}

// Basit barkod validasyonu
function isValidBarcode(barcode) {
  // EAN-13: 13 haneli rakam
  const ean13Regex = /^\d{13}$/;
  // CODE-128: 1-128 karakter olabilir (burada 1+ karakter kabul)
  const code128Regex = /^[\x00-\x7F]+$/;
  return ean13Regex.test(barcode) || code128Regex.test(barcode);
}

router.post("/validate-barcode", (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ valid: false, message: "Barkod boş!" });
    }

    const normalized = normalizeBarcode(barcode);
    const valid = isValidBarcode(normalized);

    if (!valid) {
      return res
        .status(400)
        .json({ valid: false, message: "Geçersiz barkod!" });
    }

    return res.json({
      valid: true,
      normalized,
      message: "Geçerli barkod",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ valid: false, message: "Sunucu hatası!" });
  }
});

module.exports = router;
