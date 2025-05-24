const response = require("../utils/response");
const harajat = require("../model/expense");
const sales = require("../model/saleSchema");
const moment = require("moment-timezone");
const alwaysMaterialStory = require("../model/alwaysMaterialStory");
const ishlabchiqarishTarixiForDate = require("../model/ishlabchiqarishTarixiForDateModel");

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
      const result = await alwaysMaterialStory.aggregate([
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
              materialId: "$_id",
            },
            totalQuantity: { $sum: "$quantity" },
            totalPrice: { $sum: { $multiply: ["$price", "$quantity"] } },
          },
        },
        {
          $group: {
            _id: {
              warehouseId: "$_id.warehouseId",
              currency: "$_id.currency",
            },
            materialTypes: { $sum: 1 },
            totalQuantity: { $sum: "$totalQuantity" },
            totalPrice: { $sum: "$totalPrice" },
          },
        },
        {
          $group: {
            _id: "$_id.warehouseId",
            currencyBreakdown: {
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

        // Join with ishlabchiqarishTarixiForDate and calculate used materials
        {
          $lookup: {
            from: "ishlabchiqarishTarixiForDate",
            let: { warehouseId: "$_id" },
            pipeline: [
              {
                $match: {
                  createdAt: { $gte: startDate, $lt: endDate },
                },
              },
              {
                $lookup: {
                  from: "productnormas",
                  localField: "productNormaId",
                  foreignField: "_id",
                  as: "productNorma",
                },
              },
              { $unwind: "$productNorma" },
              { $unwind: "$productNorma.materials" },
              {
                $lookup: {
                  from: "alwaysMaterialStorySchema", // yoki materials
                  localField: "productNorma.materials.materialId",
                  foreignField: "_id",
                  as: "material",
                },
              },
              { $unwind: "$material" },
              {
                $match: {
                  $expr: {
                    $eq: ["$$warehouseId", "$material.warehouseId"],
                  },
                },
              },
              {
                $addFields: {
                  usedQuantity: {
                    $multiply: [
                      "$productNorma.materials.quantity",
                      "$quantity",
                    ],
                  },
                  totalPrice: {
                    $multiply: [
                      "$productNorma.materials.quantity",
                      "$quantity",
                      "$material.price",
                    ],
                  },
                  currency: "$material.currency",
                },
              },
              {
                $group: {
                  _id: "$currency",
                  totalPrice: { $sum: "$totalPrice" },
                  uniqueMaterials: { $addToSet: "$material._id" },
                },
              },
              {
                $project: {
                  _id: 0,
                  currency: "$_id",
                  totalPrice: 1,
                  materialTypes: { $size: "$uniqueMaterials" },
                },
              },
            ],
            as: "usedMaterials",
          },
        },

        // Final output
        {
          $project: {
            _id: 0,
            warehouseId: "$_id",
            warehouseName: "$warehouse.name",
            currencyBreakdown: 1,
            usedMaterials: 1,
          },
        },
      ]);

      if (!result.length) {
        return response.notFound(res, "Omborga material kirimi topilmadi");
      }

      return response.success(res, "Ombor ma'lumotlari", result);
    } catch (err) {
      return response.serverError(res, err.message, err);
    }
  }
}

module.exports = new DashboardController();
