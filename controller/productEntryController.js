const ProductEntry = require("../model/ProductEntrySchema");
const ProductNorma = require("../model/productNormaSchema");
const { Material, Warehouse } = require("../model/materialsModel");
const ProducedStorySchema = require("../model/producedStory");
const mongoose = require("mongoose");

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

    const warehouse = await Warehouse.findById(warehouseId).session(session);
    if (!warehouse || warehouse.category !== "Tayyor maxsulotlar") {
      return res.status(400).json({
        state: false,
        message: "Faqat 'Tayyor mahsulotlar' omboriga kirim qilinishi mumkin",
      });
    }

    const productNorma = await ProductNorma.findById(productNormaId)
      .populate("materials.materialId")
      .session(session);

    if (!productNorma) {
      return res.status(404).json({
        state: false,
        message: "Mahsulot normasi topilmadi",
      });
    }

    const rawMaterialWarehouse = await Warehouse.findOne({
      category: "Homashyolar",
    }).session(session);

    if (!rawMaterialWarehouse) {
      return res.status(400).json({
        state: false,
        message: "Xomashyolar ombori topilmadi",
      });
    }

    const insufficientMaterials = [];

    for (const norm of productNorma.materials) {
      const material = norm.materialId;
      const requiredQuantity = norm.quantity * quantity;

      const materialStock = await Material.findOne({
        _id: material._id,
        warehouseId: material.warehouseId,
      })
        .populate("supplier")
        .session(session);

      if (!materialStock || materialStock.quantity < requiredQuantity) {
        const shortage = requiredQuantity - (materialStock?.quantity || 0);
        insufficientMaterials.push({
          materialName: material?.name || "Noma'lum material",
          requiredQuantity,
          availableQuantity: materialStock?.quantity || 0,
          shortage,
        });
      }
    }

    if (insufficientMaterials.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        state: false,
        message: `Yetarli zaxira yo‘q`,
        innerData: insufficientMaterials,
      });
    }

    // Materiallarni kamaytirish
    for (const norm of productNorma.materials) {
      const material = norm.materialId;
      const requiredQuantity = norm.quantity * quantity;

      const materialStock = await Material.findOne({
        _id: material._id,
        warehouseId: material.warehouseId,
      }).session(session);

      materialStock.quantity -= requiredQuantity;
      await materialStock.save({ session });
    }

    // Tayyor mahsulot kirimi
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
        quantity,
      });
      savedEntry = await newEntry.save({ session });
    }

    // ProducedStorySchema
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
      exact.quantity = +exact.quantity + +quantity;
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
