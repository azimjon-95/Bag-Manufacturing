const mongoose = require("mongoose");

// Material requirement sub-schema
const MaterialRequirementSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material", // Reference to Material model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0, // Quantity cannot be less than 0
  },
});

// Main schema for product norms
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
    color: { // Replacing the original 'color' field
      type: String,
      required: true,
    },
    materials: [MaterialRequirementSchema], // Materials and their quantities
    description: {
      type: String,
    },
    size: { // Replacing 'razmer'
      type: String,
      required: true,
    },
    uniqueCode: { // Replacing 'kod'
      type: String,
      required: true,
      unique: true, // Ensures the code is unique
    },
    image: { // Replacing 'rasm'
      type: String, // Could store URL or file path to the image
    },
  },
  { timestamps: true }
);

// const ProductNorma = mongoose.model("ProductNorma", ProductNormaSchema);

module.exports = mongoose.models.ProductNorma || mongoose.model("ProductNorma", ProductNormaSchema);


