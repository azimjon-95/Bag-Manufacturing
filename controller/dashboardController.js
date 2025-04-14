const response = require("../utils/response");
const balans = require("../model/balance");
const harajat = require("../model/expense");
const sales = require("../model/saleSchema");

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const balance = await balans.find();
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
            _id: null,
            totalExpense: { $sum: "$amount" },
          },
        },
      ]);

      // 1 oylik foyda
      let salesData = await sales.aggregate([
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
            _id: null,
            totalSales: { $sum: "$totalPrice" },
          },
        },
      ]);

      let profit =
        salesData.length > 0
          ? salesData[0].totalSales -
            (harajatlar.length > 0 ? harajatlar[0].totalExpense : 0)
          : 0;

      let data = {
        balance: balance[0].balance || 0,
        totalExpense: harajatlar.length > 0 ? harajatlar[0].totalExpense : 0,
        profit: profit,
      };

      return response.success(res, "Balans topildi", data);
    } catch (error) {
      return response.serverError(res, "Serverda xatolik: " + error.message);
    }
  }
}

module.exports = new DashboardController();
