const response = require("../utils/response");
const workersDB = require("../model/workersModel");

class WorkerController {
  async getWorkers(req, res) {
    try {
      const workers = await workersDB.find();
      if (!workers.length) return response.notFound(res, "Ishchilar topilmadi");
      response.success(res, "Barcha ishchilar", workers);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  async getWorkerById(req, res) {
    try {
      const worker = await workersDB.findById(req.params.id);
      if (!worker) return response.notFound(res, "Ishchi topilmadi");
      response.success(res, "Ishchi topildi", worker);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  async createWorker(req, res) {
    try {
      let io = req.app.get("socket");
      let data = req.body;

      // Telefon raqamini tekshirish
      let exactPhone = await workersDB.findOne({ phone: data.phone });
      if (exactPhone)
        return response.error(res, "Ishchi telefon raqami avvaldan mavjud");

      const worker = await workersDB.create(data);
      if (!worker) return response.error(res, "Ishchi qo‘shilmadi");

      io.emit("new_worker", worker);
      response.created(res, "Ishchi yaratildi", worker);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  async deleteWorker(req, res) {
    try {
      let io = req.app.get("socket");
      const worker = await workersDB.findByIdAndDelete(req.params.id);
      if (!worker) return response.error(res, "Ishchi o‘chirilmadi");

      response.success(res, "Ishchi o‘chirildi");
      io.emit("worker_deleted", worker); // "new_worker" o‘rniga "worker_deleted"
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  async updateWorker(req, res) {
    try {
      let io = req.app.get("socket");
      const data = req.body;

      // Telefon raqamini boshqa ishchi ishlatayotgan bo‘lsa tekshirish
      if (data.phone) {
        const existingWorker = await workersDB.findOne({
          phone: data.phone,
          _id: { $ne: req.params.id }, // Joriy ishchini hisobga olmaslik
        });
        if (existingWorker)
          return response.error(res, "Bu telefon raqam allaqachon mavjud");
      }

      const updatedWorker = await workersDB.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true }
      );

      if (!updatedWorker)
        return response.error(res, "Ishchi yangilashda xatolik");

      response.success(res, "Ishchi yangilandi", updatedWorker);
      io.emit("worker_updated", updatedWorker); // "new_worker" o‘rniga "worker_updated"
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  async changeStatus(req, res) {
    try {
      let io = req.app.get("socket");
      const worker = await workersDB.findById(req.params.id);
      if (!worker) return response.error(res, "Ishchi topilmadi");

      worker.isActive = !worker.isActive;
      await worker.save();

      response.success(
        res,
        `Ishchi statusi ${worker.isActive ? "aktiv" : "noaktiv"} qilindi`,
        worker
      );
      io.emit("worker_status_updated", worker);
    } catch (err) {
      response.serverError(res, err.message, err);
    }
  }

  async giveSalary(req, res) {
    try {
      const { workerId, month, salary } = req.body;

      if (!workerId || !month || !salary) {
        return response.error(res, "Ishchi, oy va oylik miqdori majburiy");
      }

      const worker = await workersDB.findById(workerId);
      if (!worker) {
        return response.notFound(res, "Ishchi topilmadi");
      }

      // Yangi oylik yozuvi qo'shish
      worker.salaryHistory.push({
        month,
        salary,
        createdAt: new Date(),
      });

      // Balansdan pul yechish
      worker.balans = (worker.balans || 0) - salary;

      let result = await worker.save();
      if (!result) return response.error(res, "Oylik berilmadi");

      response.success(res, "Oylik berildi", worker);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server xatosi" });
    }
  }

  async getSalaries(req, res) {
    try {
      const { workerId } = req.query; // optional: agar faqat bitta ishchi uchun chiqarish kerak bo'lsa

      let workers;

      if (workerId) {
        workers = await Worker.findById(workerId).select(
          "fullname salaryHistory"
        );
        if (!workers) {
          return res.status(404).json({ message: "Xodim topilmadi" });
        }
        return res.status(200).json({ worker: workers });
      } else {
        // Hammasini olish
        workers = await Worker.find({}).select("fullname salaryHistory");
        return res.status(200).json({ workers });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server xatosi" });
    }
  }
}

module.exports = new WorkerController();
