const ProductNorma = require("../model/productNormaSchema");
const { Material } = require("../model/materialsModel");
const imgbbApiKey = process.env.IMGBB_API_KEY;
const axios = require("axios");
const FormData = require("form-data");
const Response = require("../utils/response");

const createProductNorma = async (req, res) => {
  try {
    const { productName, category, color, description, size, uniqueCode } =
      req.body;
    let materials = JSON.parse(req.body.materials);

    let imageUrl = null;
    if (req.file) {
      const formData = new FormData();
      formData.append("image", req.file.buffer.toString("base64"));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        imageUrl = response.data.data.url;
      } else {
        return Response.error(res, "Rasmni imgBB ga yuklashda xatolik");
      }
    }

    // Validate all required fields
    const requiredFields = {
      productName,
      category,
      color,
      size,
      uniqueCode,
      materials,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return Response.error(
        res,
        `Quyidagi majburiy maydonlar kiritilmadi: ${missingFields.join(", ")}`
      );
    }

    // Validate materials array
    if (!Array.isArray(materials) || materials.length === 0) {
      return Response.error(res, "Materiallar massivi kiritilmadi");
    }

    // Validate materials existence and quantity in parallel
    const materialChecks = await Promise.all(
      materials.map(async (item) => {
        if (!item.materialId || !item.quantity || item.quantity <= 0) {
          return { valid: false, id: item.materialId };
        }
        const material = await Material.findById(item.materialId).populate(
          "supplier"
        );
        return { valid: !!material, id: item.materialId };
      })
    );

    const invalidMaterials = materialChecks.filter((check) => !check.valid);
    if (invalidMaterials.length > 0) {
      return Response.error(
        res,
        `Quyidagi materiallar topilmadi: ${invalidMaterials
          .map((check) => check.id)
          .join(", ")}`
      );
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
      image: imageUrl,
    });

    const savedNorma = await newNorma.save();

    return Response.success(res, "Norma yaratildi", savedNorma);
  } catch (error) {
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
      return Response.notFound(res, "Normalar topilmadi");
    }

    return Response.success(res, "Normalar muvaffaqiyatli topildi", normas);
  } catch (error) {
    return Response.serverError(
      res,
      "Server xatosi: Normalar topilmadi",
      error.message
    );
  }
};

const getProductNormaById = async (req, res) => {
  try {
    const { id } = req.params;
    const norma = await ProductNorma.findById(id)
      .populate("materials.materialId", "name unit price")
      .lean();

    if (!norma) {
      return Response.notFound(res, "Norma topilmadi");
    }

    return Response.success(res, "Norma muvaffaqiyatli topildi", norma);
  } catch (error) {
    return Response.serverError(
      res,
      "Server xatosi: Norma topilmadi",
      error.message
    );
  }
};
const updateProductNorma = async (req, res) => {
  try {
    const { id } = req.params;
    let updated = await ProductNorma.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updated) return Response.error(res, "Norma yangilanmadi");

    return Response.success(res, "Norma muvaffaqiyatli yangilandi", updated);
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi: Norma yangilanmadi",
      error: error.message,
    });
  }
};

const deleteProductNorma = async (req, res) => {
  try {
    const { id } = req.params;
    const norma = await ProductNorma.findByIdAndDelete(id);

    if (!norma) {
      return Response.notFound(res, "Norma topilmadi");
    }

    return Response.success(res, "Norma muvaffaqiyatli o‘chirildi", norma);
  } catch (error) {
    return Response.serverError(
      res,
      "Server xatosi: Norma o‘chirilmadi",
      error.message
    );
  }
};

module.exports = {
  createProductNorma,
  getAllProductNormas,
  getProductNormaById,
  updateProductNorma,
  deleteProductNorma,
};
