// qo'llanma

// mijozlar,yetkazib beruvchi, mahsulot yetkazib beruvchi yaratish =>
// -------------------------------------
// router.get("/customers", => barchasi
// -------------------------------------
// // router.post("/customers/create", => yaratish

//  fullName: {
//     type: String,
//     trim: true,
//     required: true,
//   },
//   phoneNumber: {
//     type: String,
//     trim: true,
//     required: true,
//   },
//   address: {
//     type: String,
//     trim: true,
//   },
//   type: {
//     type: String,
//     enum: ["customer", "supplier"],
//     default: "customer",
//   },

// -------------------------------------

// router.get("/customers/:id",=> kerak bopqolsa  bittasini olish uchun
// -------------------------------------
// router.put("/customers/:id"", => kerak bopqolsa  bittasini o'zgartirish uchun
// -------------------------------------
// router.delete("/customers/:id", => o'chirish
// -------------------------------------
// router.put("/customers/update-balans/:id", =>
//     {
//     "balans":5000,
//     "type":"Naqd"
// }
// -------------------------------------

// mahsulot kirim qilishda

// {
//     name: { type: String, trim: true, required: true},
//     unit: {
//       type: String,
//       enum: ["kg", "piece", "meter", "liter", "roll", "package"],
//       required: true,
//     },
//     inPackage: {type: Number,default: 0,},
//     quantity: {type: Number,min: 0,required: true}
//     price: {type: Number,required: true},
//     category: {type: String,trim: true,},
//     yagonaId: {type: String},

// supplier _id si kelish kerak
//     supplier: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customers",
//       required: true,
//     },

// eski holatda warehouseId
//     warehouseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Mywarehouse",
//       required: true,
//     },
//   },

// umumiy pachkalardagi miqdorni backenda yozadi

// -------------------------------------

// MAHSULOTNI KIRIM QILISHDA  supplier ni  supplier _id si kelish kerak boshqa joyi ozgarmagan

// -------------------------------------

// SOTUV BOLIMI
// OLDINGISI FAQAT 1TA SOTISHGA MOSLAGANGAN EDI => ENDI KOPROQ SOTA OLADI
//   {
//     products: [
//       {
//         productNormaId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "ProductNorma",
//         },
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "IncomingProduct",
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,
//         },
//         sale_price: {
//           type: Number,
//           required: true,
//           min: 0,
//         },
//       },
//     ],
// BU HAM SUPPLIER NI _ID SI KELISHI KERAK
//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customers",
//       required: true,
//     }, //
//     payment: {
//       type: {
//         type: String,
//         enum: ["Naqd", "Karta orqali"],
//         required: true,
//       },
//       paidAmount: {
//         type: Number,
//         required: true,
//         min: 0,
//         default: 0,
//       }
//     },
//   },
// -------------------------------------

// BRAK MAHSULOTLAR
// router.post("/brak-create",

// {
//     name: { type: String, required: true }, // mahsulot yoki hom ashyo nomi
//     warehouseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Warehouse",
//       required: true,
//     },
//     quantity: { type: Number, required: true },
//     type: {
//       type: String,
//       enum: ["product", "material"],
//       required: true,
//     },
//     reason: { type: String, required: true },
//     associated_id: { // MAHSULOT || PRODUCT _id SI
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//     },
//   },

// -------------------------------------
// router.get("/brak-all", => royhatini olish

// -------------------------------------

// OYLIK
// router.put("/workers/salary/:id", => oyli berish
// body dan kelsin
// month: { type: String },
// salary: { type: Number },

// router.get("/workers/given-salaries", => Barcha berilgan oyliklar
