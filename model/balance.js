const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
    balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("balance", balanceSchema);





