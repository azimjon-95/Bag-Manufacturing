const Attendance = require("../model/attendanceModel"); // Model yo‘li sizning loyihangizga bog‘liq
const moment = require("moment");
const response = require("../utils/response"); // Response helper

async function getMonthlyWorkerSalaries(req, res) {
  try {
    const { year, month } = req.body;

    // Yil va oy kiritilganligini tekshirish
    if (!year || !month) {
      return response.badRequest(res, "Yil va oy kiritilishi shart");
    }

    // Yil va oyni number ga aylantirish
    const yearNum = parseInt(year);
    const monthNum = parseInt(month); // 1-12 oralig‘ida

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return response.badRequest(res, "Yil yoki oy noto‘g‘ri kiritildi");
    }

    // Oyning boshlanishi va tugashi
    const startOfMonth = moment([yearNum, monthNum - 1])
      .startOf("month")
      .toDate();
    const endOfMonth = moment([yearNum, monthNum - 1])
      .endOf("month")
      .toDate();

    // Aggregation pipeline
    const pipeline = [
      {
        // Berilgan oy ichidagi yozuvlarni filtr qilish
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        // Ishchilar bo‘yicha guruhlash
        $group: {
          _id: {
            workerId: "$workerId",
            workType: "$workType", // Har bir ishchi uchun workType ni saqlaymiz
          },
          totalSalary: {
            $sum: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$workType", "hourly"] },
                    then: { $multiply: ["$totalHours", "$hourlyWage"] },
                  },
                  {
                    case: { $eq: ["$workType", "daily"] },
                    then: "$dailySalary",
                  },
                  {
                    case: { $eq: ["$workType", "piecework"] },
                    then: "$pieceWorkTotal",
                  },
                ],
                default: 0,
              },
            },
          },
          attendances: { $push: "$$ROOT" }, // Har bir ishchi uchun yozuvlar
        },
      },
      {
        // Worker ma'lumotlarini populate qilish
        $lookup: {
          from: "workers", // Worker modelining collection nomi
          localField: "_id.workerId",
          foreignField: "_id",
          as: "workerInfo",
        },
      },
      {
        $unwind: "$workerInfo", // workerInfo ni arraydan chiqarish
      },
      {
        // Kerakli ma'lumotlarni formatlash
        $project: {
          workerId: "$_id.workerId",
          workerName: "$workerInfo.fullname", // Worker modelida name bor deb faraz qilindi
          workType: "$_id.workType",
          totalSalary: 1,
          attendances: 1,
        },
      },
    ];

    const results = await Attendance.aggregate(pipeline);

    if (!results.length) {
      return response.notFound(
        res,
        "Berilgan oyda ishchilar ma'lumotlari topilmadi"
      );
    }

    // Oy nomini o‘zbek tilida formatlash
    moment.locale("uz");
    const monthNameRaw = moment([yearNum, monthNum - 1]).format("MMMM");
    const uzMonthMapping = {
      январ: "Yanvar",
      феврал: "Fevral",
      март: "Mart",
      апрел: "Aprel",
      май: "May",
      июн: "Iyun",
      июл: "Iyul",
      август: "Avgust",
      сентябр: "Sentabr",
      октябр: "Oktabr",
      ноябр: "Noyabr",
      декабр: "Dekabr",
    };
    const monthName =
      uzMonthMapping[monthNameRaw.toLowerCase()] || monthNameRaw;

    const responseData = {
      period: `${monthName} ${yearNum}`, // Masalan: "Mart 2025"
      workers: results,
      totalSalaryAllWorkers: results.reduce(
        (sum, worker) => sum + worker.totalSalary,
        0
      ),
    };

    return response.success(
      res,
      "Ishchilarning oylik maoshlari muvaffaqiyatli olindi",
      responseData
    );
  } catch (error) {
    return response.serverError(res, "Server xatosi: " + error.message);
  }
}

module.exports = getMonthlyWorkerSalaries;
