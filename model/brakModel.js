const mongoose = require("mongoose");

const BrakSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // mahsulot yoki hom ashyo nomi
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    quantity: { type: Number, required: true },
    type: {
      type: String,
      enum: ["product", "material"],
      required: true,
    },
    reason: { type: String, required: true },
    associated_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brak", BrakSchema);
