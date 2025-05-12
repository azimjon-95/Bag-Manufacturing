const response = require("../utils/response");
const balans = require("../model/balance");
const harajat = require("../model/expense");
const sales = require("../model/saleSchema");

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const balance = await balans.findOne();
      if (!balance) {
        return response.notFound(res, "Balans topilmadi");
      }

      // 1 oylik harajatni hisoblash
      const startDate = new Date();
      startDate.setDate(1); // Oy boshidan boshlash
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Keyingi oy boshiga o'tish
      endDate.setDate(1); // Keyingi oy boshidan boshlash
      // aggregate harajatlar
      const harajatlar = await harajat.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$currency",
            totalExpense: { $sum: "$amount" },
          },
        },
      ]);

      // 1 oylik foyda
      const salesData = await sales.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
            "payment.currency": { $exists: true },
          },
        },
        {
          $unwind: "$products", // Har bir mahsulotni ajratib olamiz
        },
        {
          $group: {
            _id: "$payment.currency", // Valyuta bo‘yicha guruhlaymiz
            totalSales: { $sum: "$products.totalPrice" }, // Har bir mahsulotning totalPrice yig‘iladi
          },
        },
      ]);

      let profit = salesData.length
        ? salesData.find((i) => i._id === "sum").totalSales -
          (harajatlar.length
            ? harajatlar.find((i) => i._id === "sum").totalExpense
            : 0)
        : 0;

      let data = {
        balance: balance.balance || 0,
        dollar: balance.dollar || 0,
        totalExpense: {
          sum: harajatlar.length
            ? harajatlar.find((i) => i._id === "sum").totalExpense
            : 0,
          dollar: harajatlar.length
            ? harajatlar.find((i) => i._id === "dollar").totalExpense
            : 0,
        },
        profit: profit,
      };

      return response.success(res, "Dashboard malumotlari", data);
    } catch (error) {
      return response.serverError(res, "Serverda xatolik: " + error.message);
    }
  }
}

module.exports = new DashboardController();
