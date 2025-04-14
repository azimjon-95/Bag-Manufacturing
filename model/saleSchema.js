const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    productNormaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductNorma",
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mywarehouse",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    sale_price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    customer: {
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
    },
    payment: {
      type: {
        type: String,
        enum: ["Naqd", "Karta orqali"], // "Qarz" olib tashlandi
        required: true,
      },
      paidAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0, // To'langan summa
      },
      debtAmount: {
        type: Number,
        min: 0,
        default: 0, // Qarz summasi
      },
    },
    debtHistory: [
      {
        paidAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        remainingDebt: {
          type: Number,
          required: true,
          min: 0,
        },
        paymentDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isFullyPaid: {
      type: Boolean,
      default: false, // To'liq to'langanligini ko'rsatadi
    },
  },
  { timestamps: true }
);

// avtomatik total price ni hisoblash
SaleSchema.pre("save", function (next) {
  this.totalPrice = this.sale_price * this.quantity;
  next();
});

// Har bir saqlashdan oldin qarz va to'lov statusini hisoblash
SaleSchema.pre("save", function (next) {
  const sale = this;

  // Qarzni avtomatik hisoblash
  if (sale.payment.paidAmount >= sale.totalPrice) {
    sale.payment.debtAmount = 0;
    sale.isFullyPaid = true;
    // sale.debtHistory = []; // Agar to'liq to'langan bo'lsa, tarix shart emas
  } else {
    sale.payment.debtAmount = sale.totalPrice - sale.payment.paidAmount;
    if (sale.payment.paidAmount > 0 && sale.debtHistory.length === 0) {
      // Birinchi qisman to'lov bo'lsa, tarixga qo'shish
      sale.debtHistory.push({
        paidAmount: sale.payment.paidAmount,
        remainingDebt: sale.payment.debtAmount,
      });
    }
  }
  next();
});

// Qarzni qisman to'lash uchun metod
SaleSchema.methods.addPayment = async function (amount) {
  const sale = this;

  if (sale.isFullyPaid) {
    throw new Error("Bu sotuv allaqachon to'liq to'langan!");
  }

  sale.payment.paidAmount += amount;
  sale.payment.debtAmount = sale.totalPrice - sale.payment.paidAmount;

  if (sale.payment.debtAmount <= 0) {
    sale.payment.debtAmount = 0;
    sale.isFullyPaid = true;
  } else {
    sale.debtHistory.push({
      paidAmount: amount,
      remainingDebt: sale.payment.debtAmount,
    });
  }

  await sale.save();
  return sale;
};

module.exports = mongoose.model("Sale", SaleSchema);
