const ProductEntry = require("../model/ProductEntrySchema");
const ProductNorma = require("../model/productNormaSchema");
const { Material, Warehouse } = require("../model/materialsModel");
const ProducedStorySchema = require("../model/producedStory");
const mongoose = require("mongoose");
const response = require("../utils/response");
const moment = require("moment");
const ishlabchiqarishTarixiForDate = require("../model/ishlabchiqarishTarixiForDateModel");

const createProductEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productNormaId, warehouseId, quantity } = req.body;

    if (!productNormaId || !warehouseId || !quantity || quantity < 1) {
      return res.status(400).json({
        state: false,
        message: "Mahsulot normasi, ombor ID va miqdor kiritilishi shart",
      });
    }

    const warehouse = await Warehouse.findOne({
      _id: warehouseId,
      category: "Tayyor maxsulotlar",
    }).session(session);

    if (!warehouse) {
      return response.error(
        res,
        "Faqat 'Tayyor mahsulotlar' omboriga kirim qilinishi mumkin"
      );
    }

    const productNorma = await ProductNorma.findById(productNormaId)
      .populate("materials.materialId")
      .session(session);

    if (!productNorma) {
      return response.notFound(res, "Mahsulot normasi topilmadi");
    }

    const rawMaterialWarehouse = await Warehouse.findOne({
      category: "Homashyolar",
    }).session(session);

    if (!rawMaterialWarehouse) {
      return response.notFound(res, "Xomashyolar ombori topilmadi");
    }

    const insufficientMaterials = [];

    // TEKSHIRISH bosqichi
    for (const norm of productNorma.materials) {
      const material = norm.materialId;
      const requiredQty = norm.quantity * quantity;
      const materialStock = await Material.findOne({
        _id: material._id,
        warehouseId: material.warehouseId,
      })
        .populate("supplier")
        .session(session);

      if (!materialStock) {
        insufficientMaterials.push({
          materialName: material?.name || "Noma'lum material",
          reason: "Material topilmadi",
        });
        continue;
      }

      const selectedUnit = norm.unit;
      const unitData = materialStock.units.find((u) => u.unit === selectedUnit);

      if (!unitData || unitData.quantity < requiredQty) {
        insufficientMaterials.push({
          materialName: material.name,
          requiredQuantity: requiredQty,
          availableQuantity: unitData?.quantity || 0,
          shortage: requiredQty - (unitData?.quantity || 0),
          unit: selectedUnit,
        });
      }
    }

    if (insufficientMaterials.length) {
      await session.abortTransaction();
      session.endSession();
      return response.error(res, "Yetarli zaxira yo‘q", insufficientMaterials);
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
        if (remaining < 0) throw new Error(`${u.unit} miqdori yetarli emas`);
        return { unit: u.unit, quantity: remaining };
      });

      return updated;
    };

    // MATERIAL AYIRISH bosqichi
    for (const norm of productNorma.materials) {
      const material = norm.materialId;
      const requiredQty = norm.quantity * quantity;

      const materialStock = await Material.findOne({
        _id: material._id,
        warehouseId: material.warehouseId,
      }).session(session);

      materialStock.units = calculateAndUpdateUnits(
        materialStock.units,
        norm.unit,
        requiredQty
      );

      await materialStock.save({ session });
    }

    // TAYYOR MAHSULOT KIRIM ASOSIY
    let savedEntry;
    let productEntryId;

    const existingEntry = await ProductEntry.findOne({
      productNormaId,
      warehouseId,
    }).session(session);

    if (existingEntry) {
      existingEntry.quantity += +quantity;
      savedEntry = await existingEntry.save({ session });
      productEntryId = existingEntry._id;
    } else {
      const newEntry = new ProductEntry({
        productNormaId,
        warehouseId,
        quantity: +quantity,
      });
      savedEntry = await newEntry.save({ session });
      productEntryId = newEntry._id;
    }

    // ISHLAB CHIQARISH TARIXI SANA BO‘YICHA OLISH UCHUN
    const ishlabchiqarishTarixi = new ishlabchiqarishTarixiForDate({
      _id: productEntryId, // ⬅️ _id ni ProductEntry dagi _id ga tenglab qo‘yayapmiz
      productNormaId,
      warehouseId,
      quantity: +quantity,
    });
    await ishlabchiqarishTarixi.save({ session });
    // ISHLAB CHIQARISH TARIXI SANA BOYICHA OLISH UCHUN tugadi

    // PRODUCED STORY
    let exact = await ProducedStorySchema.findOne({ productNormaId }).session(
      session
    );

    if (!exact) {
      exact = await ProducedStorySchema.create(
        [
          {
            productNormaId,
            quantity,
          },
        ],
        { session }
      );
    } else {
      exact.quantity += +quantity;
      await exact.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      state: true,
      message: "Tayyor mahsulot kirimi qo‘shildi va xomashyolar ayirildi",
      innerData: savedEntry,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

const getAllProductEntries = async (req, res) => {
  try {
    const entries = await ProductEntry.find()
      .populate({
        path: "productNormaId",
        populate: {
          path: "materials.materialId",
          model: "Material",
          select: "price units", // kerakli fieldlar
        },
      })
      .populate("warehouseId");

    if (!entries.length) {
      return res.status(404).json({
        state: false,
        message: "Kirimlar topilmadi",
      });
    }

    let data = entries.map((entry) => {
      if (!entry || !entry.productNormaId) return entry;

      const materials = entry.productNormaId.materials || [];

      // HAR BIR MATERIAL UCHUN: material.price * materialNorma.quantity * entry.quantity
      const unitPrice = materials.reduce((acc, cur) => {
        const price = cur.materialId?.price || 0;
        const quantityPerUnit = cur.quantity || 0;
        return acc + price * quantityPerUnit * entry.quantity;
      }, 0);

      return {
        ...(entry.toObject?.() || entry),
        unitPrice, // umumiy kirim uchun tan narx (jami)
      };
    });

    // productNormaId bo‘yicha guruhlash
    const combinedEntries = Object.values(
      data.reduce((acc, entry) => {
        const productNormaId = entry.productNormaId?._id?.toString();
        if (!productNormaId) return acc;

        if (!acc[productNormaId]) {
          acc[productNormaId] = {
            ...entry,
            quantity: 0,
            unitPrice: 0,
          };
        }

        acc[productNormaId].quantity += entry.quantity;
        acc[productNormaId].unitPrice += entry.unitPrice;

        // eng so‘nggi entryni olish (createdAt orqali)
        if (entry.createdAt > acc[productNormaId].createdAt) {
          acc[productNormaId] = {
            ...acc[productNormaId],
            ...entry,
            quantity: acc[productNormaId].quantity,
            unitPrice: acc[productNormaId].unitPrice,
          };
        }

        return acc;
      }, {})
    );

    return res.status(200).json({
      state: true,
      message: "Barcha kirimlar",
      innerData: combinedEntries,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// ishlab chiqarish tarixini olish sana bolsa sana oraligi aks holda ushbu oy uchun
// ishlab chiqarishlar ro'yxatini olish
const getAllProductEntriesByDate = async (req, res) => {
  try {
    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = moment
        .tz(req.query.startDate, "YYYY-MM-DD", "Asia/Tashkent")
        .startOf("day")
        .toDate();
      endDate = moment
        .tz(req.query.endDate, "YYYY-MM-DD", "Asia/Tashkent")
        .endOf("day")
        .toDate();
    } else if (req.query.day) {
      const dayMoment = moment.tz(req.query.day, "YYYY-MM-DD", "Asia/Tashkent");
      startDate = dayMoment.startOf("day").toDate();
      endDate = dayMoment.endOf("day").toDate();
    } else {
      const now = moment().tz("Asia/Tashkent");
      startDate = now.clone().startOf("month").toDate();
      endDate = now.clone().add(1, "month").startOf("month").toDate();
    }

    const combinedStory = await ishlabchiqarishTarixiForDate.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$productNormaId",
          totalQuantity: { $sum: "$quantity" },
          latestEntry: { $last: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$latestEntry", { quantity: "$totalQuantity" }],
          },
        },
      },
      {
        $lookup: {
          from: "productnormas", // collection nomi (model nomi emas)
          localField: "productNormaId",
          foreignField: "_id",
          as: "productNormaId",
        },
      },
      {
        $unwind: {
          path: "$productNormaId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "materials",
          localField: "productNormaId.materials.materialId",
          foreignField: "_id",
          as: "materialsInfo",
        },
      },
      {
        $lookup: {
          from: "mywarehouses",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouseId",
        },
      },
      {
        $unwind: {
          path: "$warehouseId",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!combinedStory.length) {
      return response.notFound(
        res,
        "Ishlab chiqarish tarixi topilmadi",
        combinedStory
      );
    }

    return response.success(res, "Ishlab chiqarish tarixi", combinedStory);
  } catch (err) {
    response.serverError(res, err.message, err);
  }
};

module.exports = {
  createProductEntry,
  getAllProductEntries,
  getAllProductEntriesByDate,
};
