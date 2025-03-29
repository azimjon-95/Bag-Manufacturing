const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    login: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Owner", "Manager", "Warehouseman"], // Only these roles are allowed
      default: "Manager", // Default role is Manager
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
