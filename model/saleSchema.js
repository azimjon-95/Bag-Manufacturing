// const mongoose = require("mongoose");

// const SaleSchema = new mongoose.Schema(
//   {
//     productNormaId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ProductNorma",
//     },
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "IncomingProduct",
//     },
//     warehouseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Mywarehouse",
//       required: true,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//     sale_price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     totalPrice: {
//       type: Number,
//       min: 0,
//     },
//     customer: {
//       fullName: {
//         type: String,
//         trim: true,
//         required: true,
//       },
//       phoneNumber: {
//         type: String,
//         trim: true,
//         required: true,
//       },
//       address: {
//         type: String,
//         trim: true,
//       },
//     },
//     payment: {
//       type: {
//         type: String,
//         enum: ["Naqd", "Karta orqali"], // "Qarz" olib tashlandi
//         required: true,
//       },
//       paidAmount: {
//         type: Number,
//         required: true,
//         min: 0,
//         default: 0, // To'langan summa
//       },
//       debtAmount: {
//         type: Number,
//         min: 0,
//         default: 0, // Qarz summasi
//       },
//     },
//     debtHistory: [
//       {
//         paidAmount: {
//           type: Number,
//           required: true,
//           min: 0,
//         },
//         paymentDate: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     isFullyPaid: {
//       type: Boolean,
//       default: false, // To'liq to'langanligini ko'rsatadi
//     },
//   },
//   { timestamps: true }
// );

// // avtomatik total price ni hisoblash
// SaleSchema.pre("save", function (next) {
//   this.totalPrice = this.sale_price * this.quantity;
//   next();
// });

// // Har bir saqlashdan oldin qarz va to'lov statusini hisoblash
// SaleSchema.pre("save", function (next) {
//   const sale = this;

//   // Qarzni avtomatik hisoblash
//   if (sale.payment.paidAmount >= sale.totalPrice) {
//     sale.payment.debtAmount = 0;
//     sale.isFullyPaid = true;
//     sale.debtHistory = []; // Agar to'liq to'langan bo'lsa, tarix shart emas
//   } else {
//     sale.payment.debtAmount = sale.totalPrice - sale.payment.paidAmount;
//   }
//   next();
// });

// // Qarzni qisman to'lash uchun metod
// SaleSchema.methods.addPayment = async function (amount) {
//   if (amount <= 0) {
//     throw new Error("To'langan summa musbat bo'lishi kerak");
//   }

//   this.payment.paidAmount = (this.payment.paidAmount || 0) + amount;
//   this.payment.debtAmount = (this.payment.debtAmount || 0) - amount;

//   if (this.payment.debtAmount <= 0) {
//     this.payment.debtAmount = 0;
//     this.isFullyPaid = true;
//   }

//   this.debtHistory.push({
//     paidAmount: amount,
//     remainingDebt: this.payment.debtAmount,
//   });

//   return this.save();
// };

// module.exports = mongoose.model("Sale", SaleSchema);

const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    products: [
      {
        productNormaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductNorma",
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "IncomingProduct",
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
        warehouseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Mywarehouse",
          required: true,
        },
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
      required: true,
    }, //
    payment: {
      type: {
        type: String,
        enum: ["Naqd", "Karta orqali"],
        required: true,
      },
      paidAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      debtAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        enum: ["sum", "dollar"],
        required: true,
        default: "sum",
      },
    },
    debtHistory: [
      {
        paidAmount: {
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
      default: false,
    },
    debtDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Mahsulotlar total narxini hisoblash
SaleSchema.pre("save", function (next) {
  this.products.forEach((item) => {
    item.totalPrice = item.sale_price * item.quantity;
  });

  this.totalPrice = this.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  // Qarzni hisoblash
  if (this.payment.paidAmount >= this.totalPrice) {
    this.payment.debtAmount = 0;
    this.isFullyPaid = true;
    this.debtHistory = [];
  } else {
    this.payment.debtAmount = this.totalPrice - this.payment.paidAmount;
  }

  next();
});

// Qisman to'lov qo'shish
SaleSchema.methods.addPayment = async function (amount) {
  if (amount <= 0) {
    throw new Error("To'langan summa musbat bo'lishi kerak");
  }

  this.payment.paidAmount += amount;
  this.payment.debtAmount -= amount;

  if (this.payment.debtAmount <= 0) {
    this.payment.debtAmount = 0;
    this.isFullyPaid = true;
  }

  this.debtHistory.push({
    paidAmount: amount,
    paymentDate: new Date(),
  });

  return this.save();
};

module.exports = mongoose.model("Sale", SaleSchema);
