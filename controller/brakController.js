const BrakDb = require("../model/brakModel");
const response = require("../utils/response");
const { Material } = require("../model/materialsModel");
const ProductEntry = require("../model/ProductEntrySchema");
const IncomingProduct = require("../model/incoming.model");
const mongoose = require("mongoose");

class BrakController {
  async create(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let { type, associated_id } = req.body;
      const brak = await BrakDb.create([req.body], { session });

      if (!brak || brak.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return response.error(res, "Malumot qo‘shilmadi");
      }

      if (type === "material") {
        let exactMaterial = await Material.findById(associated_id).session(
          session
        );
        if (!exactMaterial) {
          await session.abortTransaction();
          session.endSession();
          return response.error(res, "Material topilmadi");
        }

        if (exactMaterial.quantity < req.body.quantity) {
          await session.abortTransaction();
          session.endSession();
          return response.error(res, "Material yetarli emas");
        }

        exactMaterial.quantity -= req.body.quantity;
        await exactMaterial.save({ session });
      }

      if (type === "product") {
        let [entry, incoming] = await Promise.all([
          ProductEntry.findById(associated_id).session(session),
          IncomingProduct.findById(associated_id).session(session),
        ]);

        let exact = entry || incoming;
        if (!exact) {
          await session.abortTransaction();
          session.endSession();
          return response.error(res, "Mahsulot topilmadi");
        }

        if (exact.quantity < req.body.quantity) {
          await session.abortTransaction();
          session.endSession();
          return response.error(res, "Mahsulot yetarli emas");
        }

        exact.quantity -= req.body.quantity;
        await exact.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return response.created(res, "Malumot muvaffaqiyatli qo‘shildi", brak[0]);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return response.serverError(res, error.message, error);
    }
  }

  // get all
  async getAll(req, res) {
    try {
      const braks = await BrakDb.find();
      if (!braks.length) return response.error(res, "Malumotlar topilmadi");
      return response.success(res, "Malumotlar topildi", braks);
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }
}

module.exports = new BrakController();
