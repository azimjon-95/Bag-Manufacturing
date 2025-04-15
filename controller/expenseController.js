// ExpenseController with Balance integration
const Expense = require("../model/expense");
const Balance = require("../model/balance"); // Add Balance model
const response = require("../utils/response");
const moment = require("moment");
const Workers = require("../model/workersModel");
const mongoose = require("mongoose");

class ExpenseController {
  async getExpenseById(req, res) {
    try {
      const expense = await Expense.findById(req.params.id);
      if (!expense) {
        return response.notFound(res, "Expense not found");
      }
      response.success(res, "Expense fetched successfully", expense);
    } catch (error) {
      response.serverError(res, error.message);
    }
  }
  // async createExpense(req, res) {
  //   try {
  //     let data = req.body;
  //     let newExpence = await Expense.create(data);
  //     if (!newExpence) return response.error(res, "Xarajat qo‘shilmadi");
  //     console.log("newExpence", newExpence);

  //     // update
  //     let mainBalance = null;
  //     const currentBalance = await Balance.findOne();
  //     if (!currentBalance) {
  //       let newMainBalance = await Balance.create({ balance: 0 });
  //       mainBalance = newMainBalance.balance;
  //       return response.error(res, "Balansda yetarli mablag' yoq");
  //     } else {
  //       mainBalance = currentBalance.balance;
  //     }
  //     if (newExpence.amount > mainBalance) {
  //       return response.error(res, "Balansda yetarli mablag' yoq");
  //     }

  //     currentBalance.balance -= newExpence.amount;
  //     await currentBalance.save();

  //     if (req.body.category === "Avans" || req.body.category === "Ish haqi") {
  //       const worker = await Workers.findById(req.body.relevantId);
  //       if (!worker) {
  //         return response.error(res, "Worker not found");
  //       }
  //       worker.balans -= newExpence.amount;
  //       await worker.save();
  //     }
  //     response.success(res, "Xarajat qo'shildi", newExpence);
  //   } catch (error) {
  //     if (error.name === "ValidationError") {
  //       let xatoXabari = "Xarajatni saqlashda xatolik yuz berdi: ";
  //       for (let field in error.errors) {
  //         xatoXabari +=
  //           error.errors[field].kind === "enum"
  //             ? `${field} uchun kiritilgan qiymat noto‘g‘ri`
  //             : error.errors[field].message;
  //       }
  //       return response.error(res, xatoXabari);
  //     }
  //     return response.error(res, error.message);
  //   }
  // }

  // Barcha expenselarni olish with balance

  async createExpense(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let data = req.body;

      // 1. Xarajatni yaratish
      const newExpence = await Expense.create([data], { session });
      if (!newExpence || newExpence.length === 0) {
        await session.abortTransaction();
        return response.error(res, "Xarajat qo‘shilmadi");
      }

      const expenseDoc = newExpence[0]; // create([data]) array qaytaradi

      // 2. Balansni olish va tekshirish
      let currentBalance = await Balance.findOne().session(session);
      if (!currentBalance) {
        currentBalance = await Balance.create([{ balance: 0 }], { session });
        await session.abortTransaction();
        return response.error(res, "Balansda yetarli mablag' yo'q");
      } else {
        currentBalance = Array.isArray(currentBalance)
          ? currentBalance[0]
          : currentBalance;
      }

      if (expenseDoc.amount > currentBalance.balance) {
        await session.abortTransaction();
        return response.error(res, "Balansda yetarli mablag' yo'q");
      }

      // 3. Balansdan ayirish
      currentBalance.balance -= expenseDoc.amount;
      await currentBalance.save({ session });

      // 4. Agar category Avans yoki Ish haqi bo‘lsa => xodim balansini ayirish
      if (req.body.category === "Avans" || req.body.category === "Ish haqi") {
        const worker = await Workers.findById(req.body.relevantId).session(
          session
        );
        if (!worker) {
          await session.abortTransaction();
          return response.error(res, "Worker topilmadi");
        }

        worker.balans -= expenseDoc.amount;
        await worker.save({ session });
      }

      // 5. Hammasi zo'r bo‘lsa, transactionni yakunlash
      await session.commitTransaction();
      session.endSession();

      return response.success(res, "Xarajat qo'shildi", expenseDoc);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error.name === "ValidationError") {
        let xatoXabari = "Xarajatni saqlashda xatolik yuz berdi: ";
        for (let field in error.errors) {
          xatoXabari +=
            error.errors[field].kind === "enum"
              ? `${field} uchun kiritilgan qiymat noto‘g‘ri`
              : error.errors[field].message;
        }
        return response.error(res, xatoXabari);
      }
      return response.error(res, error.message);
    }
  }

  async getAllExpenses(req, res) {
    try {
      const [expenses, balance] = await Promise.all([
        Expense.find(),
        Balance.findOne(),
      ]);

      if (!expenses.length) {
        return response.notFound(res, "No expenses found");
      }

      response.success(res, "Expenses fetched successfully", {
        expenses,
        currentBalance: balance?.balance || 0,
      });
    } catch (error) {
      response.serverError(res, error.message);
    }
  }

  // Other existing methods remain mostly the same, just adding balance info where needed
  async getExpensesByPeriod(req, res) {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return response.badRequest(res, "Start date and endDate are required");
      }

      const startOfPeriod = moment(startDate, "YYYY-MM-DD")
        .startOf("day")
        .toDate();
      const endOfPeriod = moment(endDate, "YYYY-MM-DD").endOf("day").toDate();

      if (startOfPeriod > endOfPeriod) {
        return response.badRequest(res, "Start date must be before end date");
      }

      const [results, currentBalance] = await Promise.all([
        Expense.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
            },
          },
          {
            $facet: {
              outgoing: [
                { $match: { type: "harajat" } },
                {
                  $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    expenses: { $push: "$$ROOT" },
                  },
                },
              ],
              income: [
                { $match: { type: "Kirim" } },
                {
                  $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    expenses: { $push: "$$ROOT" },
                  },
                },
              ],
              all: [{ $sort: { date: 1 } }],
            },
          },
        ]),
        Balance.findOne(),
      ]);

      if (!results?.[0]?.all.length) {
        return response.notFound(res, "No expenses found for the given period");
      }

      moment.locale("uz");
      const formattedStartRaw = moment(startOfPeriod).format("D-MMMM");
      const formattedEndRaw = moment(endOfPeriod).format("D-MMMM");

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

      function convertToLatin(formattedDate) {
        const [day, month] = formattedDate.split("-");
        const trimmedMonth = month.trim().toLowerCase();
        const latinMonth = uzMonthMapping[trimmedMonth] || month;
        return `${day} -${latinMonth}`;
      }

      const formattedStart = convertToLatin(formattedStartRaw);
      const formattedEnd = convertToLatin(formattedEndRaw);

      const outgoingData = results[0].outgoing[0] || {
        totalAmount: 0,
        expenses: [],
      };
      const incomeData = results[0].income[0] || {
        totalAmount: 0,
        expenses: [],
      };

      const responseData = {
        period: `${formattedStart} - ${formattedEnd}`,
        allExpenses: results[0].all,
        outgoingExpenses: outgoingData.expenses,
        totalOutgoing: outgoingData.totalAmount,
        incomeExpenses: incomeData.expenses,
        totalIncome: incomeData.totalAmount,
        currentBalance: currentBalance?.balance || 0,
      };

      return response.success(
        res,
        "Expenses fetched successfully",
        responseData
      );
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }

  //getExpenseByRelevantId
  async getExpenseByRelevantId(req, res) {
    try {
      const { relevantId } = req.body;
      const expenses = await Expense.find({ relevantId });
      if (!expenses.length) {
        return response.notFound(res, "No expenses found for the given period");
      }
      return response.success(res, "Expenses fetched successfully", expenses);
    } catch (error) {
      return response.serverError(res, error.message);
    }
  }
}

module.exports = new ExpenseController();
