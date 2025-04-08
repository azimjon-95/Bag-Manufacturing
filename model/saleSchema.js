const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    productNormaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductNorma", // Sotilgan mahsulotning normasi
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mywarehouse", // Tayyor mahsulotlar ombori
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Sotilgan miqdor 1 dan kam bo‘lmasligi kerak
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0, // Umumiy narx
    },
    customerName: {
      type: String,
      trim: true,
    },
    paymentType: {
      type: String,
      enum: ["Naqd", "Karta orqali"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
