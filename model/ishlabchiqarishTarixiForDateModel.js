const mongoose = require("mongoose");

const ishlabchiqarishTarixiForDate = new mongoose.Schema(
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
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ishlabchiqarishTarixiForDate",
  ishlabchiqarishTarixiForDate
);
