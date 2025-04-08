const ProductEntry = require("../model/ProductEntrySchema");
const ProductNorma = require("../model/productNormaSchema");
const { Material, Warehouse } = require("../model/materialsModel");

// Tayyor mahsulot kirimini qo‘shish va xomashyodan ayirish
const createProductEntry = async (req, res) => {
  try {
    const { productNormaId, warehouseId, quantity } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!productNormaId || !warehouseId || !quantity || quantity < 1) {
      return res.status(400).json({
        state: false,
        message: "Mahsulot normasi, ombor ID va miqdor kiritilishi shart",
      });
    }

    // Omborni tekshirish (faqat "Tayyor mahsulotlar" kategoriyasi uchun)
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || warehouse.category !== "Tayyor maxsulotlar") {
      return res.status(400).json({
        state: false,
        message: "Faqat 'Tayyor mahsulotlar' omboriga kirim qilinishi mumkin",
      });
    }

    // Normani topish
    const productNorma = await ProductNorma.findById(productNormaId).populate(
      "materials.materialId"
    );

    if (!productNorma) {
      return res.status(404).json({
        state: false,
        message: "Mahsulot normasi topilmadi",
      });
    }

    // Xomashyo omborini topish
    const rawMaterialWarehouse = await Warehouse.findOne({
      category: "Homashyolar",
    });
    if (!rawMaterialWarehouse) {
      return res.status(400).json({
        state: false,
        message: "Xomashyolar ombori topilmadi",
      });
    }

    // Materiallarni ayirish logikasi
    for (const norm of productNorma.materials) {
      const material = norm.materialId; // Populated material obyekti
      const requiredQuantity = norm.quantity * quantity; // Umumiy kerakli miqdor

      // Materialni xomashyo omborida topish
      const materialStock = await Material.findOne({
        _id: material._id,
        warehouseId: material.warehouseId,
      });

      if (!materialStock || materialStock.quantity < requiredQuantity) {
        return res.status(400).json({
          state: false,
          message: `${
            material.name
          } uchun yetarli zaxira yo‘q. Kerak: ${requiredQuantity}, Mavjud: ${
            materialStock?.quantity || 0
          }`,
        });
      }

      // Material miqdorini ayirish
      materialStock.quantity -= requiredQuantity;
      await materialStock.save();
    }

    // Yangi kirim qo‘shish
    const newEntry = new ProductEntry({
      productNormaId,
      warehouseId,
      quantity,
    });

    const savedEntry = await newEntry.save();

    return res.status(201).json({
      state: true,
      message: "Tayyor mahsulot kirimi qo‘shildi va xomashyolar ayirildi",
      innerData: savedEntry,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// Barcha kirimlarni olish (ixtiyoriy)
const getAllProductEntries = async (req, res) => {
  try {
    const entries = await ProductEntry.find()
      .populate("productNormaId", "productName category")
      .populate("warehouseId", "name");
    if (!entries.length) {
      return res.status(404).json({
        state: false,
        message: "Kirimlar topilmadi",
      });
    }
    return res.status(200).json({
      state: true,
      message: "Barcha kirimlar",
      innerData: entries,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

module.exports = { createProductEntry, getAllProductEntries };
