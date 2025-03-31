const mongoose = require("mongoose");

const pieceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, default: "Dona", enum: ["Dona", "Metr", "Kvadrat"], },
});

module.exports = mongoose.model("Piece", pieceSchema);





