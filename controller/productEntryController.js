const ProductEntry = require("../model/ProductEntrySchema");
const ProductNorma = require("../model/productNormaSchema");
const { Material, Warehouse } = require("../model/materialsModel");
const ProducedStorySchema = require("../model/producedStory");
const mongoose = require("mongoose");
const response = require("../utils/response");

// const createProductEntry = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { productNormaId, warehouseId, quantity } = req.body;

//     if (!productNormaId || !warehouseId || !quantity || quantity < 1) {
//       return res.status(400).json({
//         state: false,
//         message: "Mahsulot normasi, ombor ID va miqdor kiritilishi shart",
//       });
//     }

//     const warehouse = await Warehouse.findOne({
//       _id: warehouseId,
//       category: "Tayyor maxsulotlar",
//     }).session(session);

//     if (!warehouse) {
//       return response.error(
//         res,
//         "Faqat 'Tayyor mahsulotlar' omboriga kirim qilinishi mumkin"
//       );
//     }

//     const productNorma = await ProductNorma.findById(productNormaId)
//       .populate("materials.materialId")
//       .session(session);

//     if (!productNorma) {
//       return response.notFound(res, "Mahsulot normasi topilmadi");
//     }

//     const rawMaterialWarehouse = await Warehouse.findOne({
//       category: "Homashyolar",
//     }).session(session);

//     if (!rawMaterialWarehouse) {
//       return response.notFound(res, "Xomashyolar ombori topilmadi");
//     }

//     const insufficientMaterials = [];

//     for (const norm of productNorma.materials) {
//       const material = norm.materialId;
//       const requiredQuantity = norm.quantity * quantity;

//       const materialStock = await Material.findOne({
//         _id: material._id,
//         warehouseId: material.warehouseId,
//       })
//         .populate("supplier")
//         .session(session);

//       let checkQty =
//         materialStock.units.find((i) => i.unit === norm.unit)?.quantity <
//         requiredQuantity;

//         if (!materialStock || checkQty) {
//         const shortage = requiredQuantity - (materialStock?.quantity || 0);
//         insufficientMaterials.push({
//           materialName: material?.name || "Noma'lum material",
//           requiredQuantity,
//           availableQuantity: materialStock?.quantity || 0,
//           shortage,
//         });
//       }
//     }

//     if (insufficientMaterials.length) {
//       await session.abortTransaction();
//       session.endSession();
//       return response.error(res, "Yetarli zaxira yo‘q", insufficientMaterials);
//     }

//     // Materiallarni kamaytirish
//     for (const norm of productNorma.materials) {
//       const material = norm.materialId;
//       const requiredQuantity = norm.quantity * quantity;

//       const materialStock = await Material.findOne({
//         _id: material._id,
//         warehouseId: material.warehouseId,
//       }).session(session);

//       materialStock.quantity -= requiredQuantity;
//       await materialStock.save({ session });
//     }

//     // Tayyor mahsulot kirimi
//     let savedEntry;
//     const existingEntry = await ProductEntry.findOne({
//       productNormaId,
//       warehouseId,
//     }).session(session);

//     if (existingEntry) {
//       existingEntry.quantity += +quantity;
//       savedEntry = await existingEntry.save({ session });
//     } else {
//       const newEntry = new ProductEntry({
//         productNormaId,
//         warehouseId,
//         quantity,
//       });
//       savedEntry = await newEntry.save({ session });
//     }

//     // ProducedStorySchema
//     let exact = await ProducedStorySchema.findOne({ productNormaId }).session(
//       session
//     );

//     if (!exact) {
//       exact = await ProducedStorySchema.create(
//         [
//           {
//             productNormaId,
//             quantity,
//           },
//         ],
//         { session }
//       );
//     } else {
//       exact.quantity = +exact.quantity + +quantity;
//       await exact.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       state: true,
//       message: "Tayyor mahsulot kirimi qo‘shildi va xomashyolar ayirildi",
//       innerData: savedEntry,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).json({
//       state: false,
//       message: "Server xatosi",
//       error: error.message,
//     });
//   }
// };

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

    // TAYYOR MAHSULOT KIRIM
    let savedEntry;
    const existingEntry = await ProductEntry.findOne({
      productNormaId,
      warehouseId,
    }).session(session);

    if (existingEntry) {
      existingEntry.quantity += +quantity;
      savedEntry = await existingEntry.save({ session });
    } else {
      const newEntry = new ProductEntry({
        productNormaId,
        warehouseId,
        quantity: +quantity,
      });
      savedEntry = await newEntry.save({ session });
    }

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
    // Fetch all entries with population
    const entries = await ProductEntry.find()
      .populate("productNormaId", "productName category uniqueCode")
      .populate("warehouseId");

    if (!entries.length) {
      return res.status(404).json({
        state: false,
        message: "Kirimlar topilmadi",
      });
    }

    // Combine entries by productNormaId
    const combinedEntries = Object.values(
      entries.reduce((acc, entry) => {
        const productNormaId = entry.productNormaId?._id.toString();

        if (!acc[productNormaId]) {
          // Initialize with the full entry, including populated fields
          acc[productNormaId] = {
            ...entry.toObject(),
            quantity: 0,
          };
        }

        // Sum the quantity
        acc[productNormaId].quantity += entry.quantity;

        // Optional: Update other fields if needed (e.g., keep the latest entry's data)
        // Example: If you want to keep the most recent entry's metadata
        if (entry.createdAt > acc[productNormaId].createdAt) {
          acc[productNormaId] = {
            ...entry.toObject(),
            quantity: acc[productNormaId].quantity, // Preserve the summed quantity
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

module.exports = { createProductEntry, getAllProductEntries };
