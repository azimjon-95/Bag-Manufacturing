const mongoose = require('mongoose');

const PieceWorkSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: {
        type: Number,
        default: function () {
            return this.quantity * this.unitPrice;
        }
    }
});

module.exports = PieceWorkSchema;