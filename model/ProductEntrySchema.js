const mongoose = require("mongoose");

const ProductEntrySchema = new mongoose.Schema(
  {
    productNormaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductNorma", // ProductNorma modeliga havola
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mywarehouse", // Warehouse modeliga havola (sizning modelda "Mywarehouse")
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Kirim miqdori 1 dan kam bo‘lmasligi kerak
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductEntry", ProductEntrySchema);
