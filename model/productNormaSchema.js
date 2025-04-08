const mongoose = require("mongoose");

// Materialni normasini saqlash uchun ichki schema
const MaterialRequirementSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material", // Material modeliga havola
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0, // Miqdor 0 dan kam bo‘lmasligi kerak
  },
});

// Tayyor mahsulotning normasini saqlash uchun asosiy schema
const ProductNormaSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    materials: [MaterialRequirementSchema], // Norma: qaysi materialdan qancha kerak
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ProductNorma =
  mongoose.models.ProductNorma ||
  mongoose.model("ProductNorma", ProductNormaSchema);

module.exports = ProductNorma;
