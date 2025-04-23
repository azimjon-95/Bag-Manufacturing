const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  defaultWorkingHours: {
    start: { type: String, default: "08:00" },
    end: { type: String, default: "17:00" },
  },
  logo: { type: String },
  quote_for_sale: { type: String, default: "Haridingizdan mamnunmiz!" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Company", CompanySchema);
