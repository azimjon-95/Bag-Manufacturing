// ExpenseController with Balance integration
const Expense = require("../model/expense");
const Balance = require("../model/balance"); // Add Balance model
const response = require("../utils/response");
const moment = require("moment");

class ExpenseController {
  // Helper method to update balance
  async updateBalance(amount, type) {
    const balanceDoc = await Balance.findOne() || new Balance();
    if (type === "harajat") {
      balanceDoc.balance -= amount;
    } else if (type === "Kirim") {
      balanceDoc.balance += amount;
    }
    balanceDoc.lastUpdated = new Date();
    return await balanceDoc.save();
  }

  //getExpenseById
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

  // Yangi expense qo'shish
  async createExpense(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let io = req.app.get("socket");
      const newExpense = new Expense(req.body);

      // Check if sufficient balance for outgoing expense
      if (newExpense.type === "harajat") {
        const currentBalance = await Balance.findOne();
        if (!currentBalance || currentBalance.balance < newExpense.amount) {
          await session.abortTransaction();
          return response.error(res, "Insufficient balance");
        }
      }

      const savedExpense = await newExpense.save({ session });
      await this.updateBalance(savedExpense.amount, savedExpense.type);

      await session.commitTransaction();
      response.created(res, "Expense created successfully", savedExpense);
      io.emit("newExpense", savedExpense);
    } catch (error) {
      await session.abortTransaction();
      if (error.name === "ValidationError") {
        let xatoXabari = "Xarajatni saqlashda xatolik yuz berdi: ";
        for (let field in error.errors) {
          xatoXabari += error.errors[field].kind === "enum"
            ? `${field} uchun kiritilgan qiymat noto‘g‘ri`
            : error.errors[field].message;
        }
        return response.error(res, xatoXabari);
      }
      return response.error(res, error.message);
    } finally {
      session.endSession();
    }
  }

  // Barcha expenselarni olish with balance
  async getAllExpenses(req, res) {
    try {
      const [expenses, balance] = await Promise.all([
        Expense.find(),
        Balance.findOne()
      ]);

      if (!expenses.length) {
        return response.notFound(res, "No expenses found");
      }

      response.success(res, "Expenses fetched successfully", {
        expenses,
        currentBalance: balance?.balance || 0
      });
    } catch (error) {
      response.serverError(res, error.message);
    }
  }

  // Expense ni yangilash
  async updateExpense(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let io = req.app.get("socket");
      const oldExpense = await Expense.findById(req.params.id);
      if (!oldExpense) {
        await session.abortTransaction();
        return response.notFound(res, "Expense not found");
      }

      // Revert old balance
      await this.updateBalance(-oldExpense.amount, oldExpense.type);

      // Check new balance if it's an outgoing expense
      if (req.body.type === "harajat" && req.body.amount) {
        const currentBalance = await Balance.findOne();
        if (currentBalance.balance < req.body.amount) {
          await session.abortTransaction();
          return response.error(res, "Insufficient balance");
        }
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, session }
      );

      await this.updateBalance(updatedExpense.amount, updatedExpense.type);
      await session.commitTransaction();

      response.success(res, "Expense updated successfully", updatedExpense);
      io.emit("newExpense", updatedExpense);
    } catch (error) {
      await session.abortTransaction();
      response.error(res, error.message);
    } finally {
      session.endSession();
    }
  }

  // Expense ni o'chirish
  async deleteExpense(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let io = req.app.get("socket");
      const deletedExpense = await Expense.findById(req.params.id);
      if (!deletedExpense) {
        await session.abortTransaction();
        return response.notFound(res, "Expense not found");
      }

      await Expense.findByIdAndDelete(req.params.id, { session });
      await this.updateBalance(-deletedExpense.amount, deletedExpense.type);

      await session.commitTransaction();
      response.success(res, "Expense deleted successfully");
      io.emit("newExpense", deletedExpense);
    } catch (error) {
      await session.abortTransaction();
      response.serverError(res, error.message);
    } finally {
      session.endSession();
    }
  }


  // Other existing methods remain mostly the same, just adding balance info where needed
  async getExpensesByPeriod(req, res) {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return response.badRequest(res, "Start date and endDate are required");
      }

      const startOfPeriod = moment(startDate, "YYYY-MM-DD").startOf("day").toDate();
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
        Balance.findOne()
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

      const outgoingData = results[0].outgoing[0] || { totalAmount: 0, expenses: [] };
      const incomeData = results[0].income[0] || { totalAmount: 0, expenses: [] };

      const responseData = {
        period: `${formattedStart} - ${formattedEnd}`,
        allExpenses: results[0].all,
        outgoingExpenses: outgoingData.expenses,
        totalOutgoing: outgoingData.totalAmount,
        incomeExpenses: incomeData.expenses,
        totalIncome: incomeData.totalAmount,
        currentBalance: currentBalance?.balance || 0
      };

      return response.success(res, "Expenses fetched successfully", responseData);
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