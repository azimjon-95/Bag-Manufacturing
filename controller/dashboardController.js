const response = require("../utils/response");
const harajat = require("../model/expense");
const sales = require("../model/saleSchema");
const moment = require("moment-timezone");

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
}

module.exports = new DashboardController();
