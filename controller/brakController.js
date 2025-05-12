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
      let { type, associated_id, unit, quantity } = req.body;
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

        let checkQTY =
          exactMaterial.units.find((i) => i.unit === unit).quantity <
          req.body.quantity;
        if (checkQTY) {
          await session.abortTransaction();
          session.endSession();
          return response.error(res, "Material yetarli emas");
        }

        // Kamaytirish funksiyasi
        const calculateAndUpdateUnits = (units, selectedUnit, usedQuantity) => {
          const unitMap = {};
          for (const u of units) {
            unitMap[u.unit] = u.quantity;
          }

          const baseAmount = unitMap[selectedUnit];
          const ratios = {};

          for (const unit of Object.keys(unitMap)) {
            ratios[unit] = baseAmount === 0 ? 0 : unitMap[unit] / baseAmount;
          }

          const updated = units.map((u) => {
            const subtractAmount = usedQuantity * ratios[u.unit];
            const remaining = u.quantity - subtractAmount;
            if (remaining < 0)
              throw new Error(`${u.unit} miqdori yetarli emas`);
            return { unit: u.unit, quantity: remaining };
          });

          return updated;
        };

        exactMaterial.units = calculateAndUpdateUnits(
          exactMaterial.units,
          unit,
          quantity
        );

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
  // async getAll(req, res) {
  //   try {
  //     const braks = await BrakDb.find().populate("warehouseId", "name");

  //     // Type bo‘yicha ajratish
  //     const materials = braks.filter((item) => item.type === "material");

  //     // products ichida IncomingProduct va ProductEntry model bo‘yicha farqlash
  //     const incomingProducts = braks.filter((item) => item.type === "product");

  //     // Materialni populate qilish
  //     const populatedMaterials = await BrakDb.populate(materials, {
  //       path: "associated_id",
  //       model: "Material",
  //       select: "category inPackage supplier unit yagonaId",
  //       populate: {
  //         path: "supplier",
  //         model: "Customers",
  //       },
  //     });

  //     // IncomingProduct bilan populate
  //     const populatedIncoming = await BrakDb.populate(incomingProducts, {
  //       path: "associated_id",
  //       model: "IncomingProduct",
  //       select: "category supplier",
  //       populate: {
  //         path: "supplier",
  //         model: "Customers",
  //       },
  //     });

  //     // // ProductEntry bilan populate
  //     // const populatedEntry = await BrakDb.populate(incomingProducts, {
  //     //   path: "associated_id",
  //     //   model: "ProductEntry",
  //     //   populate: {
  //     //     path: "productNormaId",
  //     //     model: "ProductNorma",
  //     //   },
  //     // });

  //     return response.success(res, "Malumotlar topildi", {
  //       materials: populatedMaterials,
  //       products: [...populatedIncoming],
  //     });
  //   } catch (error) {
  //     return response.serverError(res, error.message, error);
  //   }
  // }

  async getAll(req, res) {
    try {
      const braks = await BrakDb.find().populate("warehouseId", "name");

      // Type bo‘yicha ajratish
      const materials = braks.filter((item) => item.type === "material");
      const products = braks.filter((item) => item.type === "product");

      // 1. Materialni populate qilish
      const populatedMaterials = await BrakDb.populate(materials, {
        path: "associated_id",
        model: "Material",
        select: "category inPackage supplier unit yagonaId",
        populate: {
          path: "supplier",
          model: "Customers",
        },
      });

      // 2. Product -> avval IncomingProduct bilan populate qilamiz
      let populatedProducts = await BrakDb.populate(products, {
        path: "associated_id",
        model: "IncomingProduct",
        select: "category supplier uniqueCode",
        populate: {
          path: "supplier",
          model: "Customers",
        },
      });

      // 3. Agar associated_id null bo‘lsa, demak bu ProductEntry modelidan bo‘lishi mumkin
      const productsNeedingEntryPopulate = populatedProducts.filter(
        (item) => !item.associated_id
      );

      const populatedProductEntries = await BrakDb.populate(
        productsNeedingEntryPopulate,
        {
          path: "associated_id",
          model: "ProductEntry",
          populate: {
            path: "productNormaId",
            model: "ProductNorma",
          },
        }
      );

      // 4. associated_id topilganlarini va topilmaganlarini birlashtiramiz
      const finalPopulatedProducts = [
        ...populatedProducts.filter((item) => item.associated_id),
        ...populatedProductEntries,
      ];

      return response.success(res, "Malumotlar topildi", {
        materials: populatedMaterials,
        products: finalPopulatedProducts,
      });
    } catch (error) {
      return response.serverError(res, error.message, error);
    }
  }
}

module.exports = new BrakController();
