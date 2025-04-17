const Sale = require("../model/saleSchema");
const Balance = require("../model/balance");
let response = require("../utils/response");
let ProductEntry = require("../model/ProductEntrySchema");
let ImportedProducts = require("../model/incoming.model");

const createSale = async (req, res) => {
  try {
    const { productId, quantity, totalPrice } = req.body;

    // 1. Mahsulotni topish
    const [exactProduct, exactImportedProduct] = await Promise.all([
      ProductEntry.findById(productId),
      ImportedProducts.findById(productId),
    ]);

    if (!exactProduct && !exactImportedProduct) {
      return response.error(res, "Mahsulot topilmadi");
    }

    const product = exactProduct || exactImportedProduct;

    // 2. Mahsulot sonini tekshirish
    if (product.quantity < quantity) {
      return response.error(res, "Mahsulot soni yetarli emas");
    }

    // 3. Mahsulot sonini kamaytirish
    product.quantity -= quantity;
    await product.save();

    // 4. Sotuvni yaratish
    const newSale = await Sale.create({
      ...req.body,
      warehouseId: product.warehouseId,
      productNormaId: product.productNormaId,
      productId: product._id,
    });
    if (!newSale) {
      return response.error(res, "Sotishda xatolik");
    }

    // 5. Balansni yangilash
    await Balance.findOneAndUpdate(
      {},
      { $inc: { balance: totalPrice } }, // balansga qo'shish
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

// Barcha sotuvlarni olish (ixtiyoriy)
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("productNormaId", "productName category")
      .populate("productId", "productName category");
    // .populate("warehouseId", "name")
    if (!sales.length) return response.notFound(res, "Sotuvlar topilmadi");
    return response.success(res, "Sotuvlar muvaffaqiyatli topildi", sales);
  } catch (error) {
    response.serverError(res, "Sotuvni yaratishda xatolik", error.message);
  }
};

//qarzdorlar
const getDebtors = async (req, res) => {
  try {
    const debtors = await Sale.find({ isFullyPaid: false })
      .populate("productNormaId", "productName category")
      .populate("warehouseId", "name");

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
