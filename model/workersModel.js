const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    workType: {
      type: String,
      enum: ["hourly", "daily", "piecework"],
      required: true,
    },
    workingHours: {
      start: { type: String },
      end: { type: String },
    },
    rates: {
      hourly: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", WorkerSchema);
