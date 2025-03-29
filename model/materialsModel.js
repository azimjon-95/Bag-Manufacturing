const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Bo‘shliqlarni olib tashlaydi
    },
    code: {
      type: String,
      required: true,
      unique: true, // Har bir materialning kodi takrorlanmas bo‘lishi uchun
    },
    unit: {
      type: String,
      enum: ["kg", "piece", "meter", "liter", "roll"], // O‘lchov birligi
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0, // Miqdor 0 dan kam bo‘lmasligi uchun
    },
    supplier: {
      type: String,
      required: true, // Kimdan kelgani
    },
    receivedDate: {
      type: Date,
      default: Date.now, // Material qachon kelgani
    },
  },
  { timestamps: true } // createdAt va updatedAt avtomatik qo‘shiladi
);

module.exports = mongoose.model("Material", MaterialSchema);
