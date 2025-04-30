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
    // 👇 Lavozim (masalan: superadmin, sotuvchi, omborchi va h.k.)
    role: {
      type: String,
      default: "admin",
    },
    // 👇 Ruxsat berilgan yo‘llar (permissions)
    permissions: {
      type: [String], // misol: ["/sale", "/customers"]
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
