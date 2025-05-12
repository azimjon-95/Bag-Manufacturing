const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  dollar: { type: Number, default: 0 },
});

const Balancs = mongoose.model("balance", balanceSchema);
module.exports = Balancs;
