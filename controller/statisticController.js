const ProductEntry = require("../model/ProductEntrySchema");
const response = require("../utils/response");
const salesModel = require("../model/saleSchema");
const ProducedStorySchema = require("../model/producedStory");
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
    // const entries = await ProductEntry.find({
    //   createdAt: {
    //     $gte: startOfMonth, // Oy boshidan
    //     $lte: endOfMonth, // Oy oxirigacha
    //   },
    // })
    //   .populate("productNormaId", "productName category")
    //   .populate("warehouseId", "name");

    // productId hossasi yoqlarini topsin

    const result = await ProducedStorySchema.find({
      productId: { $exists: false },
    })
      .sort({ quantity: -1 }) // kamayish tartibida
      .populate({
        path: "productNormaId",
        select: "productName", // faqat nomini olib kelamiz
      });

    if (!result.length)
      return response.notFound(res, "Joriy oyda kirimlar topilmadi");

    return response.success(res, "Joriy oyning kirimlari", result);
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
    const entries = await ProducedStorySchema.find({
      productId: { $exists: false },
    })
      .sort({ quantity: -1 }) // kamayish tartibida
      .populate({
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

    // let sales = await salesModel.aggregate([
    //   {
    //     $match: {
    //       createdAt: {
    //         $gte: new Date(startOfMonth),
    //         $lte: new Date(endOfMonth),
    //       },
    //     },
    //   },
    //   {
    //     $unwind: "$products",
    //   },
    //   {
    //     $replaceRoot: { newRoot: "$products" },
    //   },
    //   // Lookup for productNormaId
    //   {
    //     $lookup: {
    //       from: "productnormas", // to‘g‘ri kolleksiya nomi (plural & lowercase)
    //       localField: "productNormaId",
    //       foreignField: "_id",
    //       as: "productNorma",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "incomingproducts", // to‘g‘ri kolleksiya nomi (plural & lowercase)
    //       localField: "productId",
    //       foreignField: "_id",
    //       as: "product",
    //     },
    //   },
    // ]);

    let sales = await salesModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startOfMonth),
            $lte: new Date(endOfMonth),
          },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $replaceRoot: { newRoot: "$products" },
      },
      {
        $group: {
          _id: {
            productId: "$productId",
            productNormaId: "$productNormaId",
          },
          totalQuantity: { $sum: "$quantity" }, // yoki `miqdori` bo‘lsa shuni yozing
        },
      },
      // Lookup for productNorma
      {
        $lookup: {
          from: "productnormas",
          localField: "_id.productNormaId",
          foreignField: "_id",
          as: "productNorma",
        },
      },
      {
        $unwind: {
          path: "$productNorma",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup for product
      {
        $lookup: {
          from: "incomingproducts",
          localField: "_id.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    response.success(res, "Joriy oyning sotuvlari", sales);
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
