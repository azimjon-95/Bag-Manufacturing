// models/Material.js
const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    unit: {
      type: String,
      enum: ["kg", "piece", "meter", "liter", "roll", "package"],
      required: true,
    },
    inPackage: {
      type: Number,
      default: 0,
    },
    totalPackageIn: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      min: 0,
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
    receivedDate: {
      type: Date,
      default: Date.now,
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

// saqlashdan avval totalPackageIn ni o'zgartirish kerak
MaterialSchema.pre("save", function (next) {
  if (this.inPackage > 0) {
    this.totalPackageIn = this.quantity * this.inPackage;
  }
  next();
});

// models/Warehouse.js
const WarehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      enum: ["Tayyor maxsulotlar", "Homashyolar"],
      required: true,
    },
  },
  { timestamps: true }
);

const Warehouse = mongoose.model("Mywarehouse", WarehouseSchema);
const Material = mongoose.model("Material", MaterialSchema);

module.exports = {
  Material,
  Warehouse,
};
