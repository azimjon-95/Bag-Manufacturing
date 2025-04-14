const ProductEntry = require("../model/ProductEntrySchema");
const response = require("../utils/response");
const salesModel = require("../model/saleSchema");
const getMonthlyEntries = async (req, res) => {
  try {
    // Joriy oyning boshlanishi va oxirini hisoblash
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Joriy oy uchun kirimlarni olish
    const entries = await ProductEntry.find({
      createdAt: {
        $gte: startOfMonth, // Oy boshidan
        $lte: endOfMonth, // Oy oxirigacha
      },
    })
      .populate("productNormaId", "productName category")
      .populate("warehouseId", "name");

    if (!entries.length)
      return response.notFound(res, "Joriy oyda kirimlar topilmadi");

    return response.success(res, "Joriy oyning kirimlari", entries);
  } catch (error) {
    return response.serverError(res, "Serverda xatolik yuz berdi");
  }
};

const getMonthlyMaterialUsage = async (req, res) => {
  try {
    // Joriy oyning boshlanishi va oxirini hisoblash
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Joriy oy uchun kirimlarni olish
    const entries = await ProductEntry.find({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).populate({
      path: "productNormaId",
      select: "productName materials",
      populate: {
        path: "materials.materialId",
        select: "name unit",
      },
    });

    if (!entries.length) {
      return response.notFound(res, "Joriy oyda kirimlar topilmadi");
    }

    // Materiallar bo'yicha umumiy miqdorni hisoblash
    const materialUsage = {};

    entries.forEach((entry) => {
      const norma = entry.productNormaId;
      if (norma && norma.materials) {
        norma.materials.forEach((material) => {
          const materialId = material.materialId._id.toString();
          const materialName = material.materialId.name;
          const materialUnit = material.materialId.unit || "";
          const quantity = material.quantity * entry.quantity; // Har bir kirim uchun material miqdori

          if (!materialUsage[materialId]) {
            materialUsage[materialId] = {
              name: materialName,
              qty: 0,
              unit: materialUnit,
            };
          }

          materialUsage[materialId].qty += quantity;
        });
      }
    });

    // Natijani array shaklida formatlash
    const result = Object.values(materialUsage).map(({ name, qty, unit }) => ({
      name,
      qty: qty || 0,
      unit: unit,
    }));

    return response.success(res, "Joriy oyning materiallari", result);
  } catch (error) {
    console.error(error);
    return response.serverError(res, "Serverda xatolik yuz berdi");
  }
};

// get monthly sales
const getMonthlySales = async (req, res) => {
  try {
    // Joriy oyning boshlanishi va oxirini hisoblash
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    // Joriy oy uchun sotuvlarni olish aggregate
    const sales = await salesModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    // natijani formatlash
    const result = sales.map((sale) => ({
      date: sale._id,
      totalSales: sale.totalSales,
    }));

    if (!result.length)
      return response.notFound(res, "Joriy oyda sotuvlar topilmadi");
    return response.success(res, "Joriy oyda sotuvlar", result);
  } catch (error) {
    console.error(error);
    return response.serverError(res, "Serverda xatolik yuz berdi");
  }
};

module.exports = {
  getMonthlyEntries,
  getMonthlyMaterialUsage,
  getMonthlySales,
};
