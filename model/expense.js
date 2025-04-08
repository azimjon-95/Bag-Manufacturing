const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "Ish haqi",
        "Avans",
        "Ijara",
        "Kantselyariya",
        "Xomashyo",
        "Transport",
        "Kommunal to‘lovlar",
        "Reklama va marketing",
        "Texnika ta’miri",
        "Soliqlar",
        "Boshqa harajatlar",
        "Qarzni to‘lash",
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    paymentType: {
      type: String,
      enum: ["Naqd", "Karta orqali"],
    },
    relevantId: {
      // oylik bolganda
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("expense", expenseSchema);
module.exports = Expense;
