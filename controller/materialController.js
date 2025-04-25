// controllers/warehouseController.js
const { Warehouse, Material } = require("../model/materialsModel");
const Response = require("../utils/response");

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
        if (existingMaterial)
          return Response.error(res, "Bunday noyob kodli material mavjud");
      }

      const material = await Material.create(req.body);
      let res1 = await material.save();
      if (!res1) return Response.error(res, "Material saqlanmadi");

      return Response.created(
        res,
        "Material muvaffaqiyatli qo‘shildi",
        material
      );
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
        if (existingMaterial) {
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
      // 1. Homashyo omborlarini topish
      const rawMaterialWarehouses = await Warehouse.find({
        category: "Homashyolar",
      }).select("_id");

      // 2. Tayyor maxsulot omborlarini topish
      const finishedProductWarehouses = await Warehouse.find({
        category: "Tayyor maxsulotlar",
      }).select("_id");

      // Agar hech qanday ombor topilmasa
      if (!rawMaterialWarehouses.length && !finishedProductWarehouses.length) {
        return Response.notFound(res, "Omborlar topilmadi");
      }

      // 3. Ombor ID larini arrayga yig‘ish
      const rawMaterialWarehouseIds = rawMaterialWarehouses.map(
        (warehouse) => warehouse._id
      );
      const finishedProductWarehouseIds = finishedProductWarehouses.map(
        (warehouse) => warehouse._id
      );

      // 4. Materiallarni ombor ID lari bo‘yicha filter qilish
      const rawMaterials = await Material.find({
        warehouseId: { $in: rawMaterialWarehouseIds },
      }).populate("supplier");

      const finishedProducts = await Material.find({
        warehouseId: { $in: finishedProductWarehouseIds },
      }).populate("supplier");

      // Agar hech qanday material topilmasa (ixtiyoriy tekshiruv)
      if (!rawMaterials.length && !finishedProducts.length) {
        return Response.notFound(res, "Materiallar topilmadi");
      }

      // 5. Javobni tayyorlash
      const responseData = {
        homashyolar: rawMaterials.length ? rawMaterials : [], // Bo‘sh array qaytarish uchun
        tayyorMaxsulotlar: finishedProducts.length ? finishedProducts : [], // Bo‘sh array qaytarish uchun
      };

      return Response.success(res, "Barcha materiallar", responseData);
    } catch (error) {
      console.error("Error:", error); // Xatolikni log qilish uchun
      return Response.serverError(res, "Server xatosi", error.message);
    }
  }
}

module.exports = new WarehouseController();
