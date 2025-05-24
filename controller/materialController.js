// controllers/warehouseController.js
const { Warehouse, Material } = require("../model/materialsModel");
const Response = require("../utils/response");
const alwaysMaterialStory = require("../model/alwaysMaterialStory");

class WarehouseController {
  // Warehouse CRUD operations
  async createWarehouse(req, res) {
    try {
      const { name, category } = req.body;
      console.log(name, category);

      if (!name || !category) {
        return Response.error(res, "Nom va kategoriya majburiy");
      }

      const warehouse = new Warehouse(req.body);
      await warehouse.save();
      return Response.created(res, "Ombor muvaffaqiyatli yaratildi", warehouse);
    } catch (error) {
      return Response.error(res, error.message);
    }
  }

  async getAllWarehouses(req, res) {
    try {
      const warehouses = await Warehouse.find();
      return Response.success(
        res,
        "Omborlar muvaffaqiyatli qaytarildi",
        warehouses
      );
    } catch (error) {
      return Response.serverError(res, "Server xatosi");
    }
  }

  async getWarehouseById(req, res) {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }
      const materials = await Material.find({ warehouseId: warehouse._id });
      return Response.success(res, "Ombor muvaffaqiyatli qaytarildi", {
        warehouse,
        materials,
      });
    } catch (error) {
      return Response.serverError(res, "Server xatosi");
    }
  }

  async updateWarehouse(req, res) {
    try {
      const warehouse = await Warehouse.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }
      return Response.success(
        res,
        "Ombor muvaffaqiyatli yangilandi",
        warehouse
      );
    } catch (error) {
      if (error.code === 11000) {
        return Response.error(res, "Bunday nomli ombor allaqachon mavjud");
      }
      return Response.error(res, error.message);
    }
  }

  async deleteWarehouse(req, res) {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }

      // Delete associated materials first
      await Material.deleteMany({ warehouseId: warehouse._id });

      // Now delete the warehouse
      await warehouse.deleteOne();

      return Response.success(
        res,
        "Ombor va uning materiallari muvaffaqiyatli o‘chirildi"
      );
    } catch (error) {
      return Response.serverError(res, "Server xatosi");
    }
  }

  // Material CRUD operations
  async addMaterial(req, res) {
    try {
      const warehouse = await Warehouse.findById(req.body.warehouseId);
      if (!warehouse) return Response.notFound(res, "Ombor topilmadi");

      const { yagonaId } = req.body;
      if (yagonaId) {
        const existingMaterial = await Material.findOne({ yagonaId }).populate(
          "supplier"
        );
        if (existingMaterial && existingMaterial?.name !== req.body.name) {
          return Response.error(res, "Bunday noyob kodli material mavjud");
        }
      }

      const material = await Material.create(req.body);
      if (!material) return Response.error(res, "Material saqlanmadi");

      // alwaysMaterialStory hujjatini _id ni Material bilan bir xil qilib saqlaymiz
      await alwaysMaterialStory.create({
        _id: material._id,
        ...material.toObject(),
      });

      Response.success(res, "Material muvaffaqiyatli saqlandi", material);
    } catch (error) {
      return Response.error(res, error.message);
    }
  }

  async updateMaterial(req, res) {
    try {
      const material = await Material.findById(req.params.materialId);
      if (!material) {
        return Response.notFound(res, "Material topilmadi");
      }

      const { yagonaId } = req.body;
      if (yagonaId && yagonaId !== material.yagonaId) {
        const existingMaterial = await Material.findOne({ yagonaId });
        if (existingMaterial?.name !== req.body.name) {
          return Response.error(res, "Bunday noyob kodli material mavjud");
        }
      }

      const updatedMaterial = await Material.findByIdAndUpdate(
        req.params.materialId,
        req.body,
        { new: true, runValidators: true }
      );
      return Response.success(
        res,
        "Material muvaffaqiyatli yangilandi",
        updatedMaterial
      );
    } catch (error) {
      if (error.code === 11000) {
        return Response.error(res, "Bunday noyob kodli material mavjud");
      }
      return Response.error(res, error.message);
    }
  }

  async deleteMaterial(req, res) {
    try {
      const material = await Material.findByIdAndDelete(req.params.materialId);
      if (!material) {
        return Response.notFound(res, "Material topilmadi");
      }
      return Response.success(res, "Material muvaffaqiyatli o‘chirildi");
    } catch (error) {
      return Response.serverError(res, "Server xatosi");
    }
  }

  async getMaterial(req, res) {
    try {
      const material = await Material.findById(req.params.materialId).populate(
        "supplier"
      );
      if (!material) {
        return Response.notFound(res, "Material topilmadi");
      }
      return Response.success(
        res,
        "Material muvaffaqiyatli qaytarildi",
        material
      );
    } catch (error) {
      return Response.serverError(res, "Server xatosi");
    }
  }

  async getMaterialsByWarehouseId(req, res) {
    try {
      const warehouseId = req.params.id;

      // Check if warehouse exists
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }

      // Get all materials in this warehouse
      const materials = await Material.find({ warehouseId }).populate(
        "supplier"
      );

      return Response.success(
        res,
        "Material muvaffaqiyatli qaytarildi",
        materials
      );
    } catch (error) {
      return Response.serverError(res, error.message);
    }
  }

  // get all materials
  async getAllMaterials(req, res) {
    try {
      const rawMaterials = await Material.find()
        .populate("supplier")
        .populate("warehouseId");

      if (!rawMaterials.length) {
        return Response.notFound(res, "Materiallar topilmadi");
      }

      return Response.success(res, "Barcha materiallar", rawMaterials);
    } catch (error) {
      console.error("Error:", error); // Xatolikni log qilish uchun
      return Response.serverError(res, "Server xatosi", error.message);
    }
  }

  async getAllMaterialsBySupplier(req, res) {
    try {
      const materials = await Material.aggregate([
        {
          $lookup: {
            from: "customers", // "Customers" modelining collection nomi kichik harflarda bo'lishi kerak
            localField: "supplier",
            foreignField: "_id",
            as: "supplier",
          },
        },
        { $unwind: "$supplier" },
        {
          $group: {
            _id: {
              supplierId: "$supplier._id",
            },
            supplierName: { $first: "$supplier.name" },
            materials: {
              $push: {
                name: "$name",
                // quantity: "$quantity",
                price: "$price",
                units: "$units",
                warehouseId: "$warehouseId",
              },
            },
            totalQuantity: { $sum: "$quantity" },
            totalPrice: { $sum: "$price" },
          },
        },
        {
          $sort: { "_id.date": -1 },
        },
      ]);

      if (!materials.length) {
        return Response.notFound(res, "Materiallar topilmadi");
      }

      return Response.success(
        res,
        "Yetkazib beruvchilarga qarab guruhlangan materiallar",
        {
          data: materials,
        }
      );
    } catch (error) {
      console.error("Error:", error);
      return Response.serverError(res, "Server xatosi", error.message);
    }
  }
}

module.exports = new WarehouseController();
