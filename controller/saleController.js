const Sale = require("../model/saleSchema");
const Balance = require("../model/balance");
let response = require("../utils/response");
let ProductEntry = require("../model/ProductEntrySchema");
let ImportedProducts = require("../model/incoming.model");

// const createSale = async (req, res) => {
//   try {
//     const { productId, quantity, totalPrice } = req.body;

//     // 1. Mahsulotni topish
//     const [exactProduct, exactImportedProduct] = await Promise.all([
//       ProductEntry.findById(productId),
//       ImportedProducts.findById(productId),
//     ]);

//     if (!exactProduct && !exactImportedProduct) {
//       return response.error(res, "Mahsulot topilmadi");
//     }

//     const product = exactProduct || exactImportedProduct;

//     // 2. Mahsulot sonini tekshirish
//     if (product.quantity < quantity) {
//       return response.error(res, "Mahsulot soni yetarli emas");
//     }

//     // 3. Mahsulot sonini kamaytirish
//     product.quantity -= quantity;
//     await product.save();

//     // 4. Sotuvni yaratish
//     const newSale = await Sale.create({
//       ...req.body,
//       warehouseId: product.warehouseId,
//       productNormaId: product.productNormaId,
//       productId: product._id,
//     });
//     if (!newSale) {
//       return response.error(res, "Sotishda xatolik");
//     }

//     // 5. Balansni yangilash
//     await Balance.findOneAndUpdate(
//       {},
//       { $inc: { balance: totalPrice } }, // balansga qo'shish
//       { upsert: true, new: true }
//     );

//     return response.created(
//       res,
//       "Sotuv muvaffaqiyatli amalga oshirildi",
//       newSale
//     );
//   } catch (error) {
//     return response.serverError(
//       res,
//       "Sotuvni yaratishda xatolik",
//       error.message
//     );
//   }
// };

const createSale = async (req, res) => {
  try {
    const { products, customer, payment } = req.body; // products => array

    if (!products || !Array.isArray(products) || products.length === 0) {
      return response.error(
        res,
        "Mahsulotlar ro'yxati bo'sh bo'lmasligi kerak"
      );
    }

    // Mahsulotlarni topish
    const productPromises = products.map(({ _id }) =>
      Promise.all([ProductEntry.findById(_id), ImportedProducts.findById(_id)])
    );

    const productResults = await Promise.all(productPromises);

    const updatedProducts = [];

    for (let i = 0; i < products.length; i++) {
      const [exactProduct, exactImportedProduct] = productResults[i];
      const productData = exactProduct || exactImportedProduct;

      if (!productData) {
        return response.error(
          res,
          `ID: ${products[i]._id} bo'yicha mahsulot topilmadi`
        );
      }

      const requestedQuantity = products[i].quantity;

      if (productData.quantity < requestedQuantity) {
        return response.error(
          res,
          `Mahsulot yetarli emas: ${productData.name || "Noma'lum mahsulot"}`
        );
      }

      // Mahsulot miqdorini kamaytirish
      productData.quantity -= requestedQuantity;
      await productData.save();

      // Saqlash uchun tayyorlab olamiz
      updatedProducts.push({
        productNormaId: productData.productNormaId,
        productId: productData._id,
        warehouseId: productData.warehouseId,
        quantity: requestedQuantity,
        sale_price: products[i].sale_price, // frontenddan kelishi kerak
      });
    }

    let debtHistory = [{ paidAmount: payment.paidAmount }];

    // Sotuvni yaratish
    const newSale = await Sale.create({
      products: updatedProducts,
      customer,
      payment,
      debtHistory,
    });

    if (!newSale) {
      return response.error(res, "Sotuvni yaratishda xatolik");
    }

    // Balansni yangilash
    await Balance.findOneAndUpdate(
      {},
      { $inc: { balance: newSale.totalPrice } },
      { upsert: true, new: true }
    );

    return response.created(
      res,
      "Sotuv muvaffaqiyatli amalga oshirildi",
      newSale
    );
  } catch (error) {
    return response.serverError(
      res,
      "Sotuvni yaratishda xatolik",
      error.message
    );
  }
};

const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate([
      {
        path: "products.productNormaId",
        select: "productName category",
      },
      {
        path: "products.productId",
        select: "productName category",
      },
      {
        path: "customer",
      },
    ]);
    if (!sales.length) return response.notFound(res, "Sotuvlar topilmadi");
    return response.success(res, "Sotuvlar muvaffaqiyatli topildi", sales);
  } catch (error) {
    response.serverError(res, "Sotuv tarixini olishda xatolik", error.message);
  }
};
//qarzdorlar
const getDebtors = async (req, res) => {
  try {
    // .populate("productNormaId", "productName category")
    // .populate("warehouseId", "name");
    const debtors = await Sale.find({ isFullyPaid: false }).populate([
      {
        path: "products.productNormaId",
        select: "productName category",
      },
      {
        path: "customer",
      },
    ]);

    if (!debtors.length) {
      return response.notFound(res, "Qarzdorlar topilmadi");
    }

    return response.success(res, "Qarzdorlar muvaffaqiyatli topildi", debtors);
  } catch (error) {
    response.serverError(res, "Qarzdorlarni olishda xatolik", error.message);
  }
};

// qarz tolash

const payDebt = async (req, res) => {
  try {
    const { saleId, amount } = req.body;

    if (!saleId || !amount || amount <= 0) {
      return response.error(res, "Ma'lumotlar to'g'ri yuborilmadi");
    }

    const sale = await Sale.findById(saleId);

    if (!sale) {
      return response.notFound(res, "Sotuv topilmadi");
    }

    await sale.addPayment(amount);

    // Agar balansga ham qo'shish kerak bo'lsa (chunki to'lov kelmoqda):
    const balance = await Balance.findOne();
    if (balance) {
      balance.balance += amount;
      await balance.save();
    } else {
      const newBalance = new Balance({ balance: amount });
      await newBalance.save();
    }

    return response.success(
      res,
      "Qarzni to'lash muvaffaqiyatli amalga oshirildi",
      sale
    );
  } catch (error) {
    response.serverError(res, "Qarz to'lashda xatolik", error.message);
  }
};

module.exports = { createSale, getAllSales, getDebtors, payDebt };
