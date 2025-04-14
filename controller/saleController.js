const Sale = require("../model/saleSchema");
const Balance = require("../model/balance");
let response = require("../utils/response");
let ProductEntry = require("../model/ProductEntrySchema");

const createSale = async (req, res) => {
  try {
    const { productNormaId, warehouseId, quantity } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!productNormaId || !warehouseId || !quantity || quantity < 1) {
      return response.error(res, "Barcha maydonlarni to'ldiring");
    }

    // Mahsulotni topish
    let tayyorProduct = await ProductEntry.findOne({
      productNormaId,
      warehouseId,
    });

    if (!tayyorProduct) {
      return response.error(res, "Mahsulot topilmadi");
    }

    // Mahsulotning quantity miqdori yetarli emasligini tekshirish
    if (tayyorProduct.quantity < quantity) {
      return response.error(res, "Mahsulot yetarli emas");
    }

    // Mahsulotni yangilash
    tayyorProduct.quantity -= quantity;

    let result = await tayyorProduct.save();

    // Sotuvni yaratish
    const newSale = await Sale.create(req.body);

    if (!newSale) {
      return response.error(res, "Sotishda xatolik");
    }

    // Balansni yangilash
    const balance = await Balance.findOne();
    if (balance) {
      balance.balance += newSale?.totalPrice;
      await balance.save();
    } else {
      const newBalance = new Balance({ balance: newSale?.totalPrice });
      await newBalance.save();
    }

    return response.created(
      res,
      "Sotuv muvaffaqiyatli amalga oshirildi",
      newSale
    );
  } catch (error) {
    response.serverError(res, "Sotuvni yaratishda xatolik", error.message);
  }
};

// Barcha sotuvlarni olish (ixtiyoriy)
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("productNormaId", "productName category")
      .populate("warehouseId", "name");
    if (!sales.length) return response.notFound(res, "Sotuvlar topilmadi");

    return response.success(res, "Sotuvlar muvaffaqiyatli topildi", sales);
  } catch (error) {
    response.serverError(res, "Sotuvni yaratishda xatolik", error.message);
  }
};

module.exports = { createSale, getAllSales };
