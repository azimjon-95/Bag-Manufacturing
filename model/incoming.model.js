const mongoose = require("mongoose");

// Schema for incoming ready-made products
const IncomingProductSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        supplier: {
            type: String,
            required: true,
            trim: true, // Name of the external supplier
        },
        quantity: {
            type: Number,
            required: true,
            min: 0, // Quantity cannot be less than 0
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0, // Price per unit cannot be negative
        },
        totalCost: {
            type: Number,
            required: true,
            min: 0, // Total cost of the incoming batch (quantity * unitPrice)
        },
        color: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
        uniqueCode: {
            type: String,
            required: true,
            unique: true, // Unique identifier for the incoming product batch
        },
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mywarehouse",
        },
        entryDate: {
            type: Date,
            default: Date.now, // Date when the product was received
        },
        description: {
            type: String,
        },
        image: {
            type: String, // URL or file path to an image of the product
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Ensure the model is only created once to avoid OverwriteModelError
module.exports = mongoose.models.IncomingProduct || mongoose.model("IncomingProduct", IncomingProductSchema);