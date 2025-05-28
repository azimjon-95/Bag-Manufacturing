const response = require("../utils/response");
const harajat = require("../model/expense");
const sales = require("../model/saleSchema");
const moment = require("moment-timezone");
const alwaysMaterialStory = require("../model/alwaysMaterialStory");
const usedMaterials = require("../model/usedMaterialsModel");

class DashboardController {
  async getDashboardData(req, res) {
    try {
      let startDate, endDate;

      // Agar frontenddan oy yuborilsa (format: "YYYY-MM")
      if (req.query.month) {
        const monthMoment = moment.tz(
          req.query.month,
          "YYYY-MM",
          "Asia/Tashkent"
        );
        startDate = monthMoment.startOf("month").toDate(); // 1-kun 00:00
        endDate = monthMoment.clone().add(1, "month").startOf("month").toDate(); // Keyingi oy 1-kuni 00:00
      } else {
        const now = moment().tz("Asia/Tashkent");
        startDate = now.clone().startOf("month").toDate();
        endDate = now.clone().add(1, "month").startOf("month").toDate();
      }

      // Harajatlarni olish
      const harajatlar = await harajat.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: "$currency",
            totalExpense: { $sum: "$amount" },
          },
        },
      ]);

      // Sotuvlarni olish
      const salesData = await sales.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate },
            "payment.currency": { $exists: true },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$payment.currency",
            totalSales: { $sum: "$products.totalPrice" },
          },
        },
      ]);

      // Qiymatlarni chiqarish (default qiymat: 0)
      const getValue = (arr, currency, field) =>
        arr.find((item) => item._id === currency)?.[field] || 0;

      const harajat_sum = getValue(harajatlar, "sum", "totalExpense");
      const harajat_dollar = getValue(harajatlar, "dollar", "totalExpense");

      const sotuv_sum = getValue(salesData, "sum", "totalSales");
      const sotuv_dollar = getValue(salesData, "dollar", "totalSales");

      const profit_sum = sotuv_sum - harajat_sum;
      const profit_dollar = sotuv_dollar - harajat_dollar;

      const data = {
        daromad: { sotuv_sum, sotuv_dollar },
        totalExpense: { harajat_sum, harajat_dollar },
        profit: { profit_sum, profit_dollar },
      };

      return response.success(res, "Dashboard ma'lumotlari", data);
    } catch (error) {
      console.error("Dashboard xatolik:", error);
      return response.serverError(res, "Xatolik: " + error.message);
    }
  }

  // async getWhereHouseInfo(req, res) {
  //   const moment = require("moment-timezone");

  //   // Sana oralig'ini belgilash
  //   let startDate, endDate;
  //   if (req.query.startDate && req.query.endDate) {
  //     startDate = moment
  //       .tz(req.query.startDate, "YYYY-MM-DD", "Asia/Tashkent")
  //       .startOf("day")
  //       .toDate();
  //     endDate = moment
  //       .tz(req.query.endDate, "YYYY-MM-DD", "Asia/Tashkent")
  //       .endOf("day")
  //       .toDate();
  //   } else {
  //     const now = moment().tz("Asia/Tashkent");
  //     startDate = now.clone().startOf("month").toDate();
  //     endDate = now.clone().add(1, "month").startOf("month").toDate();
  //   }

  //   try {
  //     // 1. KIRIM ma'lumotlarini olish (alwaysMaterialStory dan)
  //     const kirimData = await alwaysMaterialStory.aggregate([
  //       {
  //         $match: {
  //           createdAt: { $gte: startDate, $lt: endDate },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           quantity: { $arrayElemAt: ["$units.quantity", 0] },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: {
  //             warehouseId: "$warehouseId",
  //             currency: "$currency",
  //           },
  //           materialTypes: { $sum: 1 }, // Material turlarini sanash
  //           totalQuantity: { $sum: "$quantity" },
  //           totalPrice: { $sum: { $multiply: ["$price", "$quantity"] } },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$_id.warehouseId",
  //           kirim: {
  //             $push: {
  //               currency: "$_id.currency",
  //               totalQuantity: "$totalQuantity",
  //               totalPrice: "$totalPrice",
  //               materialTypes: "$materialTypes",
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "mywarehouses",
  //           localField: "_id",
  //           foreignField: "_id",
  //           as: "warehouse",
  //         },
  //       },
  //       { $unwind: "$warehouse" },
  //       {
  //         $project: {
  //           _id: 0,
  //           warehouseId: "$_id",
  //           warehouseName: "$warehouse.name",
  //           kirim: 1,
  //         },
  //       },
  //     ]);

  //     const chiqim = await usedMaterials.aggregate([
  //       {
  //         $match: {
  //           createdAt: { $gte: startDate, $lt: endDate },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: {
  //             warehouseId: "$warehouseId",
  //             currency: "$currency",
  //           },
  //           materialTypes: { $sum: 1 },
  //           totalQuantity: { $sum: "$quantity" },
  //           totalPrice: { $sum: { $multiply: ["$price", "$quantity"] } },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$_id.warehouseId",
  //           kirim: {
  //             $push: {
  //               currency: "$_id.currency",
  //               totalQuantity: "$totalQuantity",
  //               totalPrice: "$totalPrice",
  //               materialTypes: "$materialTypes",
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "mywarehouses",
  //           localField: "_id",
  //           foreignField: "_id",
  //           as: "warehouse",
  //         },
  //       },
  //       { $unwind: "$warehouse" },
  //       {
  //         $project: {
  //           _id: 0,
  //           warehouseId: "$_id",
  //           warehouseName: "$warehouse.name",
  //           kirim: 1,
  //         },
  //       },
  //     ]);

  //     // .find({
  //     //   createdAt: { $gte: startDate, $lt: endDate },
  //     // })
  //     // .populate("warehouseId", "name");

  //     return response.success(res, "Ombor kirim-chiqim ma'lumotlari", [
  //       kirimData,
  //       chiqim,
  //     ]);
  //   } catch (err) {
  //     console.error("Ombor ma'lumotlari olishda xatolik:", err);
  //     return response.serverError(res, err.message, err);
  //   }
  // }

  async getWhereHouseInfo(req, res) {
    const moment = require("moment-timezone");

    let startDate, endDate;
    if (req.query.startDate && req.query.endDate) {
      startDate = moment
        .tz(req.query.startDate, "YYYY-MM-DD", "Asia/Tashkent")
        .startOf("day")
        .toDate();
      endDate = moment
        .tz(req.query.endDate, "YYYY-MM-DD", "Asia/Tashkent")
        .endOf("day")
        .toDate();
    } else {
      const now = moment().tz("Asia/Tashkent");
      startDate = now.clone().startOf("month").toDate();
      endDate = now.clone().add(1, "month").startOf("month").toDate();
    }

    try {
      const kirimData = await alwaysMaterialStory.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $addFields: {
            quantity: { $arrayElemAt: ["$units.quantity", 0] },
          },
        },
        {
          $group: {
            _id: {
              warehouseId: "$warehouseId",
              currency: "$currency",
            },
            materialTypes: { $sum: 1 }, // Material turlarini sanash
            totalQuantity: { $sum: "$quantity" },
            totalPrice: { $sum: { $multiply: ["$price", "$quantity"] } },
          },
        },
        {
          $group: {
            _id: "$_id.warehouseId",
            kirim: {
              $push: {
                currency: "$_id.currency",
                totalQuantity: "$totalQuantity",
                totalPrice: "$totalPrice",
                materialTypes: "$materialTypes",
              },
            },
          },
        },
        {
          $lookup: {
            from: "mywarehouses",
            localField: "_id",
            foreignField: "_id",
            as: "warehouse",
          },
        },
        { $unwind: "$warehouse" },
        {
          $project: {
            _id: 0,
            warehouseId: "$_id",
            warehouseName: "$warehouse.name",
            kirim: 1,
          },
        },
      ]);

      const chiqimData = await usedMaterials.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: {
              warehouseId: "$warehouseId",
              currency: "$currency",
            },
            materialTypes: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" },
            totalPrice: { $sum: { $multiply: ["$price", "$quantity"] } },
          },
        },
        {
          $group: {
            _id: "$_id.warehouseId",
            chiqim: {
              $push: {
                currency: "$_id.currency",
                totalQuantity: "$totalQuantity",
                totalPrice: "$totalPrice",
                materialTypes: "$materialTypes",
              },
            },
          },
        },
        {
          $lookup: {
            from: "mywarehouses",
            localField: "_id",
            foreignField: "_id",
            as: "warehouse",
          },
        },
        { $unwind: "$warehouse" },
        {
          $project: {
            _id: 0,
            warehouseId: "$_id",
            warehouseName: "$warehouse.name",
            chiqim: 1,
          },
        },
      ]);

      // Kirim va chiqimlarni warehouseId bo‘yicha birlashtirish
      const warehouseMap = new Map();

      for (const kirim of kirimData) {
        warehouseMap.set(kirim.warehouseId.toString(), {
          warehouseId: kirim.warehouseId,
          warehouseName: kirim.warehouseName,
          kirim: kirim.kirim,
          chiqim: [],
        });
      }

      for (const chiqim of chiqimData) {
        const id = chiqim.warehouseId.toString();
        if (warehouseMap.has(id)) {
          warehouseMap.get(id).chiqim = chiqim.chiqim;
        } else {
          warehouseMap.set(id, {
            warehouseId: chiqim.warehouseId,
            warehouseName: chiqim.warehouseName,
            kirim: [],
            chiqim: chiqim.chiqim,
          });
        }
      }

      const result = Array.from(warehouseMap.values());

      return response.success(res, "Ombor kirim-chiqim ma'lumotlari", result);
    } catch (err) {
      console.error("Ombor ma'lumotlari olishda xatolik:", err);
      return response.serverError(res, err.message, err);
    }
  }
}

module.exports = new DashboardController();
