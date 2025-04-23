const BrakDb = require("../model/brakModel");
const response = require("../utils/response");

class BrakController {
  async create(req, res) {
    try {
      const brak = await BrakDb.create(req.body);
      if (!brak) return response.error(res, "Malumot qo‘shilmadi");
      return response.created(res, "Malumot muvaffaqiyatli qo‘shildi", brak);
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }

  // get all
  async getAll(req, res) {
    try {
      const braks = await BrakDb.find();
      if (!braks) return response.error(res, "Malumotlar topilmadi");
      return response.success(res, "Malumotlar topildi", braks);
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }
}

module.exports = new BrakController();
