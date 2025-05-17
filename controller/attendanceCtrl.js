const Attendance = require("../model/attendanceModel");
const Worker = require("../model/workersModel");
const Company = require("../model/Company");
const Response = require("../utils/response");
const moment = require("moment");

class AttendanceController {
  static async handleQRScan(req, res) {
    const { workerId } = req.body;

    if (!workerId) return Response.error(res, "workerId kiritilishi shart");

    try {
      const worker = await Worker.findById(workerId);
      if (!worker) return Response.notFound(res, "Ishchi topilmadi");

      let todayAttendance = await Attendance.findOne({
        workerId: worker._id,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      });

      if (todayAttendance && todayAttendance.status === "left") {
        return Response.error(
          res,
          "Ishchi bugun ishga kelgan va ishni yakunlagan"
        );
      }

      if (!todayAttendance) {
        let attendance = new Attendance({
          workerId: worker._id,
          workType: worker.workType,
          startTime: new Date(),
          status: "arrived",
        });
        let respons = await attendance.save();
        if (!respons) {
          return Response.notFound(res, "Ishchi topilmadi va saqlanmadi");
        }
        return Response.created(res, "Ishga kelish qayd etildi", respons);
      }

      const hozir = new Date();
      const startTime = todayAttendance.startTime;
      const minutFarqi = (hozir - startTime) / (1000 * 60);

      if (minutFarqi < 10) {
        return Response.error(
          res,
          "Ishdan erta ketmoqdasiz! Kamida 10 minut ishlash kerak."
        );
      }

      if (worker.workType === "daily") {
        todayAttendance.dailySalary = worker.rates.daily;
        todayAttendance.status = "left";
        todayAttendance.endTime = new Date();
        let response = await todayAttendance.save();

        worker.balans = worker.balans + worker.rates.daily;
        let savedWorker = await worker.save();

        if (!response || !savedWorker) {
          return Response.notFound(res, "Ishchi topilmadi va saqlanmadi");
        }
        return Response.success(
          res,
          "Ishdan ketish qayd etildi",
          todayAttendance
        );
      }

      if (worker.workType === "hourly") {
        todayAttendance.endTime = new Date();

        // Ishlangan vaqt (soatlarda, 2 xonagacha)
        const totalHours =
          (todayAttendance.endTime - todayAttendance.startTime) /
          (1000 * 60 * 60);
        todayAttendance.totalHours = Number(totalHours.toFixed(2));

        // Ish haqi (soat * stavka), 2 xonagacha
        todayAttendance.hourlyWage = Number(
          (todayAttendance.totalHours * worker.rates.hourly).toFixed(2)
        );

        todayAttendance.status = "left";
        let response = await todayAttendance.save();

        // Agar balansga qo‘shish kerak bo‘lsa:
        worker.balans += todayAttendance.hourlyWage;
        let savedWorker = await worker.save();

        if (!response || !savedWorker) {
          return Response.notFound(res, "Ishchi topilmadi va saqlanmadi");
        }
        return Response.success(
          res,
          "Ishdan ketish qayd etildi",
          todayAttendance
        );
      }

      if (worker.workType === "piecework") {
        todayAttendance.status = "left";
        todayAttendance.endTime = new Date();
        let response = await todayAttendance.save();
        if (!response) {
          return Response.notFound(res, "Ishchi topilmadi va saqlanmadi");
        }
        return Response.success(
          res,
          "Ishdan ketish qayd etildi",
          todayAttendance
        );
      }
    } catch (error) {
      return Response.serverError(res, "Server xatosi: " + error.message);
    }
  }

  // Add piecework
  static async addPieceWork(req, res) {
    const { attendanceId, pieceWorkData } = req.body;
    if (!attendanceId || !pieceWorkData) {
      return Response.error(
        res,
        "attendanceId va ish malumotlari kiritilishi shart"
      );
    }
    try {
      const attendance = await Attendance.findById(attendanceId);
      if (!attendance) {
        return Response.notFound(res, "ishchi topilmadi");
      }

      if (attendance.status === "left") {
        return Response.error(
          res,
          "Ishchi ishni yakunlagan, yangi ish belgilash mumkin emas"
        );
      }

      const worker = await Worker.findById(attendance.workerId);

      attendance.pieceWorks.push(pieceWorkData);
      attendance.pieceWorkTotal = attendance.pieceWorks.reduce(
        (sum, work) => sum + work.totalPrice,
        0
      );

      worker.balans += attendance.pieceWorkTotal;

      let res1 = await attendance.save();
      let res2 = await worker.save();
      if (!res1 || !res2) {
        return Response.notFound(res, "Ishchi topilmadi va saqlanmadi");
      }

      return Response.success(res, "Malumotlar saqlandi", attendance);
    } catch (error) {
      return Response.serverError(res, "Server xatosi: " + error.message);
    }
  }

  // Get attendance by ID
  // static async getAttendanceById(req, res) {
  //   const { id } = req.params;
  //   let startDate, endDate;

  //   // Agar frontenddan oy yuborilsa (format: "YYYY-MM")
  //   if (req.query.month) {
  //     const monthMoment = moment.tz(
  //       req.query.month,
  //       "YYYY-MM",
  //       "Asia/Tashkent"
  //     );
  //     startDate = monthMoment.startOf("month").toDate(); // 1-kun 00:00
  //     endDate = monthMoment.clone().add(1, "month").startOf("month").toDate(); // Keyingi oy 1-kuni 00:00
  //   } else {
  //     const now = moment().tz("Asia/Tashkent");
  //     startDate = now.clone().startOf("month").toDate();
  //     endDate = now.clone().add(1, "month").startOf("month").toDate();
  //   }
  //   try {
  //     const attendance = await Attendance.find({
  //       workerId: id,
  //       // createdAt: { $gte: startDate, $lt: endDate },
  //     }).populate("workerId");
  //     if (!attendance.length) {
  //       return Response.notFound(res, "Malumot topilmadi");
  //     }
  //     return Response.success(res, "Malumot topildi", attendance);
  //   } catch (error) {
  //     return Response.serverError(res, "Server xatosi: " + error.message);
  //   }
  // }

  static async getAttendanceById(req, res) {
    const { id } = req.params;
    const monthQuery = req.query.month;
    let targetMonth;

    if (monthQuery && moment(monthQuery, "YYYY-MM", true).isValid()) {
      targetMonth = moment.tz(monthQuery, "YYYY-MM", "Asia/Tashkent");
    } else {
      targetMonth = moment().tz("Asia/Tashkent");
    }

    const startDate = targetMonth.clone().startOf("month").toDate();
    const endDate = targetMonth
      .clone()
      .add(1, "month")
      .startOf("month")
      .toDate();

    try {
      const attendance = await Attendance.find({
        workerId: id,
        createdAt: { $gte: startDate, $lt: endDate },
      }).populate("workerId");

      if (!attendance.length) {
        return Response.notFound(res, "Ma'lumot topilmadi");
      }

      return Response.success(res, "Ma'lumot topildi", attendance);
    } catch (error) {
      return Response.serverError(res, "Server xatosi: " + error.message);
    }
  }

  // Get  attendance  all
  static async getAttendanceAll(req, res) {
    try {
      // only fullname
      const attendance = await Attendance.find().populate(
        "workerId",
        "fullname"
      );
      if (!attendance) {
        return Response.notFound(res, "Attendance topilmadi");
      }
      return Response.success(res, "Attendance topildi", attendance);
    } catch (error) {
      return Response.serverError(res, "Server xatosi: " + error.message);
    }
  }

  static async getAttendanceTodays(req, res) {
    try {
      const { date } = req.query;
      if (!date) return Response.badRequest(res, "Sana yuborilmadi");

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // const allWorkers = await Worker.find(
      //   { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      //   "_id fullname workType"
      // );

      const attendance = await Attendance.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).populate("workerId", "fullname");

      // const result = allWorkers.map((worker) => {
      //   const found = attendance.find(
      //     (a) => a.workerId.toString() === worker._id.toString()
      //   );

      //   return {
      //     _id: worker._id,
      //     fullname: worker.fullname,
      //     workType: worker.workType,
      //     date: found?.date || null,
      //     startTime: found?.startTime || null,
      //     endTime: found?.endTime || null,
      //     totalHours: found?.totalHours || null,
      //     pieceWorks: found?.pieceWorks || [],
      //     dailySalary: found?.dailySalary || null,
      //     hourlyWage: found?.hourlyWage || null,
      //     pieceWorkTotal: found?.pieceWorkTotal || null,
      //   };
      // });

      return Response.success(res, "Tanlangan kundagi davomat", attendance);
    } catch (error) {
      return Response.serverError(res, "Server xatosi: " + error.message);
    }
  }

  static async getAttendanceTodaysPiecework(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Find attendance records for today with workType 'piecework'
      const attendance = await Attendance.find({
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
        workType: "piecework",
        status: "arrived",
      }).populate("workerId"); // Optionally populate workerId for worker details

      if (attendance.length === 0) {
        return Response.notFound(
          res,
          "Bugungi piecework attendance topilmadi",
          []
        );
      }

      return Response.success(
        res,
        "Bugungi ishbay hodimlar topildi",
        attendance
      );
    } catch (error) {
      return Response.serverError(res, "Server xatosi: " + error.message);
    }
  }
}

module.exports = AttendanceController;
