// Controller
const ProductNorma = require("../model/productNormaSchema"); // Adjusted path
const { Material } = require("../model/materialsModel");

const createProductNorma = async (req, res) => {
  try {
    const {
      productName,
      category,
      color,
      materials,
      description,
      size,
      uniqueCode,
      image
    } = req.body;

    // Validate all required fields
    const requiredFields = { productName, category, color, size, uniqueCode, materials };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        state: false,
        message: `Quyidagi majburiy maydonlar kiritilmadi: ${missingFields.join(", ")}`,
      });
    }

    // Validate materials array
    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({
        state: false,
        message: "Materiallar ro‘yxati bo‘sh bo‘lmasligi kerak",
      });
    }

    // Validate materials existence and quantity in parallel
    const materialChecks = await Promise.all(
      materials.map(async (item) => {
        if (!item.materialId || !item.quantity || item.quantity <= 0) {
          return { valid: false, id: item.materialId };
        }
        const material = await Material.findById(item.materialId);
        return { valid: !!material, id: item.materialId };
      })
    );

    const invalidMaterials = materialChecks.filter(check => !check.valid);
    if (invalidMaterials.length > 0) {
      return res.status(400).json({
        state: false,
        message: `Noto‘g‘ri materiallar: ${invalidMaterials.map(m => m.id).join(", ")}`,
      });
    }

    // Create new product norma
    const newNorma = new ProductNorma({
      productName,
      category,
      color,
      materials,
      description,
      size,
      uniqueCode,
      image,
    });

    const savedNorma = await newNorma.save();

    return res.status(201).json({
      state: true,
      message: "Norma muvaffaqiyatli yaratildi",
      innerData: savedNorma,
    });
  } catch (error) {
    // Handle unique code duplicate error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        state: false,
        message: "Bu uniqueCode allaqachon ishlatilgan",
      });
    }

    return res.status(500).json({
      state: false,
      message: "Server xatosi: Norma yaratilmadi",
      error: error.message,
    });
  }
};

const getAllProductNormas = async (req, res) => {
  try {
    const normas = await ProductNorma.find()
      .populate("materials.materialId", "name unit price")
      .lean();

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