// controllers/warehouseController.js
const Warehouse = require("../model/materialsModel");
const Response = require("../utils/response"); // Assuming response.js is in the same directory

class WarehouseController {
  // Warehouse CRUD operations
  async createWarehouse(req, res) {
    try {
      const { name, category, description } = req.body;
      const warehouse = new Warehouse({
        name,
        description,
        category,
        materials: [],
      });
      await warehouse.save();
      return Response.created(res, "Ombor muvaffaqiyatli yaratildi", warehouse);
    } catch (error) {
      return Response.error(res, error.message);
    }
  }

  async getAllWarehouses(req, res) {
    try {
      const warehouses = await Warehouse.find();
      return Response.success(res, "Omborlar muvaffaqiyatli olindi", warehouses);
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
      return Response.success(res, "Ombor muvaffaqiyatli olindi", warehouse);
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
      return Response.success(res, "Ombor muvaffaqiyatli yangilandi", warehouse);
    } catch (error) {
      return Response.error(res, error.message);
    }
  }

  async deleteWarehouse(req, res) {
    try {
      const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }
      return Response.success(res, "Ombor muvaffaqiyatli o'chirildi");
    } catch (error) {
      return Response.serverError(res, "Server xatosi");
    }
  }

  // Material CRUD operations within Warehouse
  async addMaterial(req, res) {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }

      warehouse.materials.push(req.body);
      await warehouse.save();
      return Response.created(res, "Material muvaffaqiyatli qo'shildi", warehouse);
    } catch (error) {
      return Response.error(res, error.message);
    }
  }

  async updateMaterial(req, res) {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }

      const material = warehouse.materials.id(req.params.materialId);
      if (!material) {
        return Response.notFound(res, "Material topilmadi");
      }

      material.set(req.body);
      await warehouse.save();
      return Response.success(res, "Material muvaffaqiyatli yangilandi", warehouse);
    } catch (error) {
      return Response.error(res, error.message);
    }
  }

  async deleteMaterial(req, res) {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }

      const material = warehouse.materials.id(req.params.materialId);
      if (!material) {
        return Response.notFound(res, "Material topilmadi");
      }

      material.remove();
      await warehouse.save();
      return Response.success(res, "Material muvaffaqiyatli o'chirildi", warehouse);
    } catch (error) {
      return Response.error(res, error.message);
    }
  }

  async getMaterial(req, res) {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return Response.notFound(res, "Ombor topilmadi");
      }

      const material = warehouse.materials.id(req.params.materialId);
      if (!material) {
        return Response.notFound(res, "Material topilmadi");
      }

      return Response.success(res, "Material muvaffaqiyatli olindi", material);
    } catch (error) {
      return Response.serverError(res, "Server xatosi");
    }
  }
}

module.exports = new WarehouseController();