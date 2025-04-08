const ProductNorma = require("../model/productNormaSchema");
const { Material } = require("../model/materialsModel"); // Material modelini import qilish

// Norma yaratish
const createProductNorma = async (req, res) => {
  try {
    const { productName, category, materials, description } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!productName || !category || !materials || !Array.isArray(materials)) {
      return res.status(400).json({
        state: false,
        message:
          "Mahsulot nomi, kategoriyasi va materiallar ro‘yxati kiritilishi shart",
      });
    }

    // Materiallarning mavjudligini tekshirish
    for (const item of materials) {
      const materialExists = await Material.findById(item.materialId);
      if (!materialExists) {
        return res.status(404).json({
          state: false,
          message: `Material topilmadi: ID ${item.materialId}`,
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          state: false,
          message:
            "Har bir material uchun miqdor kiritilishi kerak va 0 dan katta bo‘lishi lozim",
        });
      }
    }

    // Yangi norma yaratish
    const newNorma = new ProductNorma({
      productName,
      category,
      materials,
      description,
    });

    const savedNorma = await newNorma.save();

    return res.status(201).json({
      state: true,
      message: "Norma muvaffaqiyatli yaratildi",
      innerData: savedNorma,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi: Norma yaratilmadi",
      error: error.message,
    });
  }
};

// Barcha normalarni olish (ixtiyoriy)
const getAllProductNormas = async (req, res) => {
  try {
    const normas = await ProductNorma.find().populate(
      "materials.materialId",
      "name"
    );
    if (!normas.length) {
      return res.status(404).json({
        state: false,
        message: "Normalar topilmadi",
      });
    }
    return res.status(200).json({
      state: true,
      message: "Barcha normalar",
      innerData: normas,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

module.exports = { createProductNorma, getAllProductNormas };
