const CustomerDB = require("../model/customerModel");
const response = require("../utils/response");

class CustomerController {
  async createCustomer(req, res) {
    try {
      const newCustomer = await CustomerDB.create(req.body);
      if (!newCustomer) return response.error(res, "Mijoz qo'shilmadi!");
      response.success(res, "Mijoz muvaffaqiyatli qo'shildi!", newCustomer);
    } catch (error) {
      response.serverError(res, error.message, error);
    }
  }

  async getAllCustomers(req, res) {
    try {
      const customers = await CustomerDB.find().sort({ createdAt: -1 });
      if (!customers.length)
        return response.notFound(res, "Mijozlar topilmadi!", []);
      response.success(res, "Mijozlar ro'yxati", customers);
    } catch (error) {
      response.serverError(res, error.message, error);
    }
  }

  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerDB.findById(id);
      if (!customer) return response.notFound(res, "Mijoz topilmadi!");
      response.success(res, "Mijoz topildi", customer);
    } catch (error) {
      response.serverError(res, error.message, error);
    }
  }

  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { fullName, phoneNumber, address } = req.body;

      if (!fullName || !phoneNumber || !address) {
        return response.error(
          res,
          "Iltimos, mijoz uchun to'liq ma'lumotlarni kiriting!"
        );
      }

      const customer = await CustomerDB.findByIdAndUpdate(
        id,
        { fullName, phoneNumber, address },
        { new: true, runValidators: true }
      );

      if (!customer) {
        return response.error(res, "Mijoz topilmadi!");
      }

      response.success(res, "Mijoz muvaffaqiyatli yangilandi!", customer);
    } catch (error) {
      response.serverError(res, error.message, error);
    }
  }

  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerDB.findByIdAndDelete(id);
      if (!customer) return response.notFound(res, "Mijoz topilmadi!");
      response.success(res, "Mijoz o'chirildi!", customer);
    } catch (error) {
      response.serverError(res, error.message, error);
    }
  }

  // update balans
  async updateBalans(req, res) {
    try {
      const { id } = req.params;
      const { balans, type } = req.body;
      let customer = await CustomerDB.findById(id);
      if (!customer) return response.notFound(res, "Mijoz topilmadi!");
      customer.balans += balans;
      customer.paymentsHistory.push({
        amount: balans,
        type,
      });
      let result = await customer.save();
      if (!result) return response.error(res, "Balans yangilanmadi!");
      response.success(res, "Balans muvaffaqiyatli yangilandi!", result);
    } catch (error) {
      response.serverError(res, error.message, error);
    }
  }
}

module.exports = new CustomerController();
