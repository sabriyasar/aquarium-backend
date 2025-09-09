require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/connection");

const productRoutes = require("./routes/productRoutes");
const costsRouter = require("./routes/costs");
const productsImport = require("./routes/productsImport");

const app = express();

// MongoDB bağlantısı
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:4040", // local frontend
      "https://aquarium-web-app.vercel.app", // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/costs", costsRouter);
app.use("/api/productsImport", productsImport);

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ msg: "Backend çalışıyor" });
});

const PORT = process.env.PORT || 4141;
app.listen(PORT, () =>
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`)
);
