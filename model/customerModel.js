const { Schema, model } = require("mongoose");

const customerSchema = new Schema({
  fullName: {
    type: String,
    trim: true,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: true,
  },
  address: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ["customer", "supplier"],
    default: "customer",
  },
  balans: {
    type: Number,
    default: 0,
  },
  paymentsHistory: [
    {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      paymentDate: {
        type: Date,
        default: Date.now,
      },
      type: {
        type: String,
        enum: ["Naqd", "Karta orqali"],
        required: true,
      },
    },
  ],
});

module.exports = model("Customers", customerSchema);
