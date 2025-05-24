//  doimiy saqlanadi kamaymaydi ishlatilganda
// models/Material.js
const mongoose = require("mongoose");

const alwaysMaterialStorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    units: [
      {
        unit: {
          type: String,
          enum: ["kg", "piece", "meter", "liter", "roll", "package", "karobka"],
          required: true,
        },
        quantity: {
          type: Number,
          min: 0,
          required: true,
        },
        inPackage: {
          type: Number,
          default: 0,
        },
      },
    ],
    currency: {
      type: String,
      enum: ["sum", "dollar"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    yagonaId: {
      type: String,
      // default: () => `MAT-${Math.random().toString(36).substr(2, 9)}`,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
      required: true,
    },
    warehouseId: {
      // Added Warehouse reference
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mywarehouse",
      required: true,
    },
  },
  { timestamps: true }
);

const Material = mongoose.model(
  "alwaysMaterialStorySchema",
  alwaysMaterialStorySchema
);

module.exports = Material;
