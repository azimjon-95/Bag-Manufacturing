const Balance = require("../model/balance");
const response = require("../utils/response");

class BalanceController {

    // get balance
    async getBalance(req, res) {
        try {
            const balance = await Balance.find();
            if (!balance) {
                return response.notFound(res, "Balans topilmadi");
            }
            return response.success(res, "Balans topildi", balance);
        } catch (error) {
            return response.serverError(res, "Serverda xatolik: " + error.message);
        }
    }
}

module.exports = new BalanceController();
