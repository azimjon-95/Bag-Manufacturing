const { model, Schema } = require("mongoose");

const usedMaterialSchema = new Schema(
  {
    materialId: {
      type: Schema.Types.ObjectId,
      ref: "Material",
    },
    unit: {
      type: String,
      enum: ["kg", "piece", "meter", "liter", "roll", "package", "karobka"],
      required: true,
    },
    currency: {
      type: String,
      enum: ["sum", "dollar"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Mywarehouse",
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = model("UsedMaterial", usedMaterialSchema);
