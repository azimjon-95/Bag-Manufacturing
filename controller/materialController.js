const response = require("../utils/response");
const materialsDB = require("../model/materialsModel"); // MaterialSchema modeli

class MaterialController {
  // Barcha materiallarni olish
  async getMaterials(req, res) {
    try {
      const materials = await materialsDB.find();
      if (!materials.length)
        return response.notFound(res, "Materiallar topilmadi");
      response.success(res, "Barcha materiallar", materials);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // ID bo‘yicha bitta materialni olish
  async getMaterialById(req, res) {
    try {
      const material = await materialsDB.findById(req.params.id);
      if (!material) return response.notFound(res, "Material topilmadi");
      response.success(res, "Material topildi", material);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Yangi material qo‘shish
  async createMaterial(req, res) {
    try {
      let io = req.app.get("socket");
      let data = req.body;

      // Material kodi takrorlanmasligini tekshirish
      let exactMaterial = await materialsDB.findOne({ code: data.code });
      if (exactMaterial)
        return response.error(res, "Bu kodli material allaqachon mavjud");

      const material = await materialsDB.create(data);
      if (!material) return response.error(res, "Material qo‘shilmadi");

      io.emit("new_material", material);
      response.created(res, "Material qo‘shildi", material);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Materialni o‘chirish
  async deleteMaterial(req, res) {
    try {
      let io = req.app.get("socket");
      const material = await materialsDB.findByIdAndDelete(req.params.id);
      if (!material) return response.error(res, "Material o‘chirilmadi");

      response.success(res, "Material o‘chirildi");
      io.emit("material_deleted", material);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Materialni yangilash
  async updateMaterial(req, res) {
    try {
      let io = req.app.get("socket");
      const data = req.body;

      // Agar kod yangilansa, takrorlanmasligini tekshirish
      if (data.code) {
        const existingMaterial = await materialsDB.findOne({
          code: data.code,
          _id: { $ne: req.params.id }, // Joriy materialni hisobga olmaslik
        });
        if (existingMaterial)
          return response.error(res, "Bu kodli material allaqachon mavjud");
      }

      const updatedMaterial = await materialsDB.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true }
      );

      if (!updatedMaterial)
        return response.error(res, "Material yangilashda xatolik");

      response.success(res, "Material yangilandi", updatedMaterial);
      io.emit("material_updated", updatedMaterial);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  // Material zaxirasini yangilash (masalan, ishlatilganda yoki qo‘shilganda)
  async updateStock(req, res) {
    try {
      let io = req.app.get("socket");
      const { quantity } = req.body; // Yangi miqdor yoki o‘zgarish

      const material = await materialsDB.findById(req.params.id);
      if (!material) return response.error(res, "Material topilmadi");

      // Zaxirani yangilash
      material.stock = quantity >= 0 ? quantity : material.stock + quantity;
      if (material.stock < 0)
        return response.error(res, "Zaxira manfiy bo‘lishi mumkin emas");

      await material.save();

      response.success(res, "Material zaxirasi yangilandi", material);
      io.emit("material_stock_updated", material);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }
}

module.exports = new MaterialController();
