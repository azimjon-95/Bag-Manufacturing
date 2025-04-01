// models/Material.js
const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    enum: ["kg", "piece", "meter", "liter", "roll"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true, // Har bir materialning kodi takrorlanmas bo‘lishi uchun
  },
  supplier: {
    type: String,
    required: true, // Kimdan kelgani
  },
  receivedDate: {
    type: Date,
    default: Date.now, // Material qachon kelgani
  },
}, { timestamps: true });

const WarehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    enum: ["Tayyor maxsulotlar", "Homashyolar"], // Only these options allowed
    required: true, // Making it required, remove this if it should be optional
  },
  materials: [MaterialSchema],  // Embedded materials array
}, { timestamps: true });

module.exports = mongoose.model("Warehouse", WarehouseSchema);







