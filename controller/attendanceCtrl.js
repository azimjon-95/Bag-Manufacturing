const Attendance = require('../model/attendanceModel');
const Worker = require('../model/workersModel');
const Company = require('../model/Company');
const Response = require('../utils/response'); // Assuming the response class is in a file named 'response.js'

class AttendanceController {
    // Helper function to calculate wage and hours
    static async calculateWage(worker, attendance, fullDayHours, expectedStartTime, expectedEndTime) {
        const startTime = attendance.startTime;

        if (worker.workType === 'daily') {
            attendance.dailySalary = worker.rates.daily;
            if (startTime > expectedStartTime) {
                const hoursLate = (startTime - expectedStartTime) / (1000 * 60 * 60);
                const deduction = (hoursLate / fullDayHours) * worker.rates.daily;
                attendance.dailySalary = Math.max(0, worker.rates.daily - deduction);
            }
        } else if (worker.workType === 'hourly') {
            const hoursLate = startTime > expectedStartTime
                ? (startTime - expectedStartTime) / (1000 * 60 * 60)
                : 0;
            const remainingHours = Math.max(0, fullDayHours - hoursLate);
            attendance.hourlyWage = remainingHours * worker.rates.hourly;
        }

        return attendance;
    }

    // QR scan handler
    static async handleQRScan(req, res) {
        const { workerId } = req.body;

        if (!workerId) {
            return Response.error(res, "workerId kiritilishi shart");
        }

        try {
            const worker = await Worker.findById(workerId);
            if (!worker) {
                return Response.notFound(res, "Ishchi topilmadi");
            }

            const today = new Date().setHours(0, 0, 0, 0);
            let attendance = await Attendance.findOne({
                workerId: worker._id,
                date: { $gte: today }
            });

            // Fetch default working hours from Company model
            const company = await Company.findOne();
            if (!company || !company.defaultWorkingHours) {
                return Response.serverError(res, "Kompaniya sozlamalari topilmadi");
            }

            const { start, end } = company.defaultWorkingHours;
            const [startHour, startMinute] = start.split(':').map(Number);
            const [endHour, endMinute] = end.split(':').map(Number);

            const expectedStartTime = new Date(today);
            expectedStartTime.setHours(startHour, startMinute, 0, 0);

            const expectedEndTime = new Date(today);
            expectedEndTime.setHours(endHour, endMinute, 0, 0);

            const fullDayHours = (expectedEndTime - expectedStartTime) / (1000 * 60 * 60);

            if (!attendance) {
                attendance = new Attendance({
                    workerId: worker._id,
                    workType: worker.workType,
                    startTime: new Date(),
                    date: new Date(),
                    dailySalary: 0,
                    hourlyWage: 0,
                    status: 'arrived'
                });

                // Use explicit class reference instead of 'this'
                await AttendanceController.calculateWage(worker, attendance, fullDayHours, expectedStartTime, expectedEndTime);
                await attendance.save();
                return Response.created(res, "Ishga kelish qayd etildi", attendance);
            }

            if (attendance.status === 'arrived') {
                attendance.endTime = new Date();
                attendance.status = 'left';

                if (worker.workType === 'hourly') {
                    const hoursWorked = (attendance.endTime - attendance.startTime) / (1000 * 60 * 60);
                    attendance.hourlyWage = hoursWorked * worker.rates.hourly;
                } else if (worker.workType === 'daily' && attendance.endTime < expectedEndTime) {
                    const hoursWorked = (attendance.endTime - attendance.startTime) / (1000 * 60 * 60);
                    const deduction = ((fullDayHours - hoursWorked) / fullDayHours) * worker.rates.daily;
                    attendance.dailySalary = Math.max(0, worker.rates.daily - deduction);
                }

                await attendance.save();
                return Response.success(res, "Ishdan ketish qayd etildi", attendance);
            }

            return Response.warning(res, "Bugungi ish allaqachon yakunlangan");
        } catch (error) {
            return Response.serverError(res, "Server xatosi: " + error.message);
        }
    }

    // Add piecework
    static async addPieceWork(req, res) {
        const { attendanceId, pieceWorkData } = req.body;

        if (!attendanceId || !pieceWorkData) {
            return Response.error(res, "attendanceId va pieceWorkData kiritilishi shart");
        }

        try {
            const attendance = await Attendance.findById(attendanceId);
            if (!attendance || attendance.workType !== 'piecework') {
                return Response.notFound(res, "Abyom ishchi topilmadi");
            }

            attendance.pieceWorks.push(pieceWorkData);
            attendance.pieceWorkTotal = attendance.pieceWorks.reduce(
                (sum, work) => sum + work.totalPrice,
                0
            );
            attendance.status = 'completed';

            await attendance.save();
            return Response.success(res, "Ish qo'shildi", attendance);
        } catch (error) {
            return Response.serverError(res, "Server xatosi: " + error.message);
        }
    }

    // Get attendance by ID
    static async getAttendanceById(req, res) {
        const { id } = req.params;

        try {
            const attendance = await Attendance.findById(id).populate('workerId');
            if (!attendance) {
                return Response.notFound(res, "Attendance topilmadi");
            }
            return Response.success(res, "Attendance topildi", attendance);
        } catch (error) {
            return Response.serverError(res, "Server xatosi: " + error.message);
        }
    }

    // Get  attendance  all
    static async getAttendanceAll(req, res) {
        try {
            const attendance = await Attendance.find();
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
            // Get the start and end of today
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

            // Find attendance records for today
            const attendance = await Attendance.find({
                date: {
                    $gte: today,
                    $lt: tomorrow
                }
            });

            if (!attendance || attendance.length === 0) {
                return Response.notFound(res, "Bugungi attendance topilmadi", []);
            }

            return Response.success(res, "Bugungi attendance topildi", attendance);
        } catch (error) {
            return Response.serverError(res, "Server xatosi: " + error.message);
        }
    }



    static async getAttendanceTodaysPiecework(req, res) {
        try {
            // Get the start and end of today
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

            // Find attendance records for today with workType 'piecework'
            const attendance = await Attendance.find({
                date: {
                    $gte: today,
                    $lt: tomorrow
                },
                workType: 'piecework'
            }); // Optionally populate workerId for worker details

            if (!attendance || attendance.length === 0) {
                return Response.notFound(res, "Bugungi piecework attendance topilmadi", []);
            }

            return Response.success(res, "Bugungi piecework attendance topildi", attendance);
        } catch (error) {
            return Response.serverError(res, "Server xatosi: " + error.message);
        }
    }
}

module.exports = AttendanceController;

