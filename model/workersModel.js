const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    workType: {
      type: String,
      enum: ["daily", "hourly", "task"], // kunbay, soatbay, ishbay
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      default: 0, // kunlik, soatlik yoki ish bo'yicha stavka
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", WorkerSchema);
