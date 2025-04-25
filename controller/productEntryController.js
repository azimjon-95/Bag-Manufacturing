const ProductEntry = require("../model/ProductEntrySchema");
const ProductNorma = require("../model/productNormaSchema");
const { Material, Warehouse } = require("../model/materialsModel");

// const createProductEntry = async (req, res) => {
//   try {
//     const { productNormaId, warehouseId, quantity } = req.body;

//     // Majburiy maydonlarni tekshirish
//     if (!productNormaId || !warehouseId || !quantity || quantity < 1) {
//       return res.status(400).json({
//         state: false,
//         message: "Mahsulot normasi, ombor ID va miqdor kiritilishi shart",
//       });
//     }

//     // Omborni tekshirish (faqat "Tayyor mahsulotlar" kategoriyasi uchun)
//     const warehouse = await Warehouse.findById(warehouseId);
//     if (!warehouse || warehouse.category !== "Tayyor maxsulotlar") {
//       return res.status(400).json({
//         state: false,
//         message: "Faqat 'Tayyor mahsulotlar' omboriga kirim qilinishi mumkin",
//       });
//     }

//     // Normani topish
//     const productNorma = await ProductNorma.findById(productNormaId).populate(
//       "materials.materialId"
//     );

//     if (!productNorma) {
//       return res.status(404).json({
//         state: false,
//         message: "Mahsulot normasi topilmadi",
//       });
//     }

//     // Xomashyo omborini topish
//     const rawMaterialWarehouse = await Warehouse.findOne({
//       category: "Homashyolar",
//     });
//     if (!rawMaterialWarehouse) {
//       return res.status(400).json({
//         state: false,
//         message: "Xomashyolar ombori topilmadi",
//       });
//     }

//     // Yetishmayotgan materiallar ro‘yxati
//     const insufficientMaterials = [];

//     // Materiallarni tekshirish
//     for (const norm of productNorma.materials) {
//       const material = norm.materialId; // Populated material obyekti
//       const requiredQuantity = norm.quantity * quantity; // Umumiy kerakli miqdor

//       // Materialni xomashyo omborida topish
//       const materialStock = await Material.findOne({
//         _id: material?._id,
//         warehouseId: material?.warehouseId,
//       });

//       if (!materialStock || materialStock.quantity < requiredQuantity) {
//         const shortage = requiredQuantity - (materialStock?.quantity || 0);
//         insufficientMaterials.push({
//           materialName: material?.name || "Noma'lum material",
//           requiredQuantity,
//           availableQuantity: materialStock?.quantity || 0,
//           shortage,
//         });
//       }
//     }

//     // Agar yetishmayotgan materiallar bo‘lsa, xabar qaytarish
//     if (insufficientMaterials.length > 0) {
//       const errorMessage = insufficientMaterials
//         .map(
//           (item) =>
//             `${item.materialName} ${item.shortage} ${
//               item.materialName.includes("metr") ? "metr" : "kilo"
//             } kam`
//         )
//         .join(", ");
//       return res.status(400).json({
//         state: false,
//         // message: `Yetarli zaxira yo‘q: ${errorMessage}`,
//         message: `Yetarli zaxira yo‘q`,
//         innerData: insufficientMaterials,
//       });
//     }

//     // Materiallarni ayirish
//     for (const norm of productNorma.materials) {
//       const material = norm.materialId;
//       const requiredQuantity = norm.quantity * quantity;

//       const materialStock = await Material.findOne({
//         _id: material._id,
//         warehouseId: material.warehouseId,
//       });

//       materialStock.quantity -= requiredQuantity;
//       await materialStock.save();
//     }

//     // Yangi kirim qo‘shish
//     const newEntry = new ProductEntry({
//       productNormaId,
//       warehouseId,
//       quantity,
//     });

//     const savedEntry = await newEntry.save();

//     return res.status(201).json({
//       state: true,
//       message: "Tayyor mahsulot kirimi qo‘shildi va xomashyolar ayirildi",
//       innerData: savedEntry,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       state: false,
//       message: "Server xatosi",
//       error: error.message,
//     });
//   }
// };

const createProductEntry = async (req, res) => {
  try {
    const { productNormaId, warehouseId, quantity } = req.body;

    if (!productNormaId || !warehouseId || !quantity || quantity < 1) {
      return res.status(400).json({
        state: false,
        message: "Mahsulot normasi, ombor ID va miqdor kiritilishi shart",
      });
    }

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse || warehouse.category !== "Tayyor maxsulotlar") {
      return res.status(400).json({
        state: false,
        message: "Faqat 'Tayyor mahsulotlar' omboriga kirim qilinishi mumkin",
      });
    }

    const productNorma = await ProductNorma.findById(productNormaId).populate(
      "materials.materialId"
    );
    if (!productNorma) {
      return res.status(404).json({
        state: false,
        message: "Mahsulot normasi topilmadi",
      });
    }

    const rawMaterialWarehouse = await Warehouse.findOne({
      category: "Homashyolar",
    });
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
        _id: material?._id,
        warehouseId: material?.warehouseId,
      }).populate("supplier");

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
      const errorMessage = insufficientMaterials
        .map(
          (item) =>
            `${item.materialName} ${item.shortage} ${
              item.materialName.includes("metr") ? "metr" : "kilo"
            } kam`
        )
        .join(", ");
      return res.status(400).json({
        state: false,
        message: `Yetarli zaxira yo‘q`,
        innerData: insufficientMaterials,
      });
    }

    // Materiallardan kerakli miqdorni ayirish
    for (const norm of productNorma.materials) {
      const material = norm.materialId;
      const requiredQuantity = norm.quantity * quantity;

      const materialStock = await Material.findOne({
        _id: material._id,
        warehouseId: material.warehouseId,
      });

      materialStock.quantity -= requiredQuantity;
      await materialStock.save();
    }

    // Yaratishdan oldin tekshirish: productNormaId va warehouseId bo'yicha
    const existingEntry = await ProductEntry.findOne({
      productNormaId,
      warehouseId,
    });

    let savedEntry;
    if (existingEntry) {
      // Agar mavjud bo'lsa, quantity ni yangilash
      existingEntry.quantity += +quantity;
      savedEntry = await existingEntry.save();
    } else {
      // Aks holda, yangi kirim yaratish
      const newEntry = new ProductEntry({
        productNormaId,
        warehouseId,
        quantity,
      });
      savedEntry = await newEntry.save();
    }

    return res.status(201).json({
      state: true,
      message: "Tayyor mahsulot kirimi qo‘shildi va xomashyolar ayirildi",
      innerData: savedEntry,
    });
  } catch (error) {
    return res.status(500).json({
      state: false,
      message: "Server xatosi",
      error: error.message,
    });
  }
};

// Barcha kirimlarni olish (ixtiyoriy)
// const getAllProductEntries = async (req, res) => {
//   try {
//     // Fetch all entries with population
//     const entries = await ProductEntry.find()
//       .populate("productNormaId", "productName category")
//       .populate("warehouseId", "name");

//     if (!entries.length) {
//       return res.status(404).json({
//         state: false,
//         message: "Kirimlar topilmadi",
//       });
//     }

//     // Combine entries by productNormaId
//     const combinedEntries = Object.values(
//       entries.reduce((acc, entry) => {
//         const productNormaId = entry?.productNormaId?._id.toString();

//         if (!acc[productNormaId]) {
//           acc[productNormaId] = { ...entry.toObject(), quantity: 0 };
//         }

//         acc[productNormaId].quantity += entry.quantity;
//         return acc;
//       }, {})
//     );

//     return res.status(200).json({
//       state: true,
//       message: "Barcha kirimlar",
//       innerData: combinedEntries,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       state: false,
//       message: "Server xatosi",
//       error: error.message,
//     });
//   }
// };

const getAllProductEntries = async (req, res) => {
  try {
    // Fetch all entries with population
    const entries = await ProductEntry.find()
      .populate("productNormaId", "productName category")
      .populate("warehouseId", "name");

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
