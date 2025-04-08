const Sale = require("../model/saleSchema");
const { Material, Warehouse } = require("../model/materialsModel");
const ProductNorma1 = require("../model/ProductNormaSchema");

const createSale = async (req, res) => {
  try {
    const {
      productNormaId,
      warehouseId,
      quantity,
      totalPrice,
      customerName,
      paymentType,
    } = req.body;

    // Majburiy maydonlarni tekshirish
    if (
      !productNormaId ||
      !warehouseId ||
      !quantity ||
      quantity < 1 ||
      !totalPrice ||
      !paymentType
    ) {
      return res.status(400).json({
        state: false,
        message: "Barcha majburiy maydonlar kiritilishi shart",
      });
    }

    // Omborni tekshirish (faqat "Tayyor maxsulotlar" omboridan sotiladi)
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || warehouse.category !== "Tayyor maxsulotlar") {
      return res.status(400).json({
        state: false,
        message: "Faqat 'Tayyor mahsulotlar' omboridan sotish mumkin",
      });
    }

    // Normani tekshirish
    const productNorma = await ProductNorma1.findById(productNormaId);
    if (!productNorma) {
      return res.status(404).json({
        state: false,
        message: "Mahsulot normasi topilmadi",
      });
    }

    // Ombordagi tayyor mahsulotni topish
    const materialStock = await Material.findOne({
      warehouseId,
      category: "Tayyor mahsulot",
      name: productNorma.productName, // Mahsulot nomi normaga mos keladi deb faraz qilindi
    });

    if (!materialStock || materialStock.quantity < quantity) {
      return res.status(400).json({
        state: false,
        message: `Omborda yetarli mahsulot yo‘q. Mavjud: ${
          materialStock?.quantity || 0
        }, Talab: ${quantity}`,
      });
    }

    // Mahsulot miqdorini kamaytirish
    materialStock.quantity -= quantity;
    await materialStock.save();

    // Yangi sotuvni qo‘shish
    const newSale = new Sale({
      productNormaId,
      warehouseId,
      quantity,
      totalPrice,
      customerName,
      paymentType,
    });

    const savedSale = await newSale.save();

    return res.status(201).json({
      state: true,
      message: "Sotuv muvaffaqiyatli qayd etildi",
      innerData: savedSale,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// Barcha sotuvlarni olish (ixtiyoriy)
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("productNormaId", "productName category")
      .populate("warehouseId", "name");
    if (!sales.length) {
      return res.status(404).json({
        state: false,
        message: "Sotuvlar topilmadi",
      });
    }
    return res.status(200).json({
      state: true,
      message: "Barcha sotuvlar",
      innerData: sales,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

module.exports = { createSale, getAllSales };
