const { Material } = require("../model/materialsModel");
const saleSchema = require("../model/saleSchema");
const incomingModel = require("../model/incoming.model");
const response = require("../utils/response");
const mongoose = require("mongoose");
const moment = require("moment");

class AktsverkaController {
  async getOne(req, res) {
    try {
      let { supplier_id, startDate, endDate } = req.body;

      // check supplier_id mongo _id
      let checkSupplier_id = mongoose.Types.ObjectId.isValid(supplier_id);
      if (!checkSupplier_id)
        return response.error(res, "supplier_id yaroqsiz!");

      let result = {
        incomingMaterials: [],
        incomingProducts: [],
        sales: [],
      };

      // Vaqt oraliqni tayyorlaymiz (agar mavjud bo‘lsa)
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      }

      let [supplier, supplier2] = await Promise.all([
        Material.find({
          supplier: supplier_id,
          ...dateFilter,
        }).populate("supplier"),
        incomingModel
          .find({
            supplier: supplier_id,
            ...dateFilter,
          })
          .populate("supplier"),
      ]);
      result.incomingMaterials = supplier;
      result.incomingProducts = supplier2;

      let customersData = await saleSchema
        .find({
          customer: supplier_id,
          ...dateFilter,
        })
        .populate("customer")
        .populate("products.productNormaId")
        .populate("products.productId");

      result.sales = customersData;

      if (
        !result.sales.length &&
        !result.incomingMaterials.length &&
        !result.incomingProducts.length
      ) {
        return response.error(res, "Malumotlar topilmadi", result);
      }

      return response.success(res, "Malumotlar topildi", result);
    } catch (error) {
      console.error(error);
      return response.error(res, "Ichki xatolik yuz berdi");
    }
  }
}

module.exports = new AktsverkaController();
