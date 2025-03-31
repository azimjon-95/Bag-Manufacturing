const Attendance = require('../model/attendanceModel');
const Worker = require('../model/workersModel');
const Company = require('../model/Company');

class AttendanceController {
    // Ish soatlari va maoshni hisoblash uchun yordamchi funksiya
    static async calculateWage(worker, attendance, fullDayHours, expectedStartTime, expectedEndTime) {
        const currentTime = attendance.startTime;

        if (currentTime > expectedStartTime) {
            const hoursLate = (currentTime - expectedStartTime) / (1000 * 60 * 60);
            if (worker.workType === 'daily') {
                const deduction = (hoursLate / fullDayHours) * worker.rates.daily;
                attendance.dailySalary = Math.max(0, worker.rates.daily - deduction);
            } else if (worker.workType === 'hourly') {
                const remainingHours = Math.max(0, fullDayHours - hoursLate);
                attendance.hourlyWage = remainingHours * worker.rates.hourly;
            }
        } else {
            if (worker.workType === 'daily') {
                attendance.dailySalary = worker.rates.daily;
            } else if (worker.workType === 'hourly') {
                attendance.hourlyWage = fullDayHours * worker.rates.hourly;
            }
        }

        return attendance;
    }

    // QR skan qilish
    static async handleQRScan(req, res) {
        const { workerId } = req.body;

        try {
            const worker = await Worker.findById(workerId);
            if (!worker) return res.status(404).json({ error: "Ishchi topilmadi" });

            const today = new Date().setHours(0, 0, 0, 0);
            let attendance = await Attendance.findOne({
                workerId: worker._id,
                date: { $gte: today }
            });

            const company = await Company.find();
            const { start: startTimeStr, end: endTimeStr } = company.defaultWorkingHours;
            const [startHour, startMinute] = startTimeStr.split(':').map(Number);
            const [endHour, endMinute] = endTimeStr.split(':').map(Number);

            const expectedStartTime = new Date();
            expectedStartTime.setHours(startHour, startMinute, 0, 0);

            const expectedEndTime = new Date();
            expectedEndTime.setHours(endHour, endMinute, 0, 0);

            const fullDayHours = (expectedEndTime - expectedStartTime) / (1000 * 60 * 60);

            if (!attendance) {
                attendance = new Attendance({
                    workerId: worker._id,
                    workType: worker.workType,
                    startTime: new Date(),
                    dailySalary: worker.rates.daily,
                    hourlyWage: worker.rates.hourly
                });

                await this.calculateWage(worker, attendance, fullDayHours, expectedStartTime, expectedEndTime);
                await attendance.save();
                return res.status(201).json({ message: "Ishga kelish qayd etildi", attendance });
            } else if (attendance.status === 'arrived') {
                attendance.endTime = new Date();
                attendance.status = 'left';

                if (worker.workType === 'hourly') {
                    attendance.hourlyWage = attendance.totalHours * worker.rates.hourly;
                } else if (worker.workType === 'daily' && attendance.endTime < expectedEndTime) {
                    const hoursWorked = (attendance.endTime - attendance.startTime) / (1000 * 60 * 60);
                    const deduction = ((fullDayHours - hoursWorked) / fullDayHours) * worker.rates.daily;
                    attendance.dailySalary = Math.max(0, worker.rates.daily - deduction);
                }

                await attendance.save();
                return res.status(200).json({ message: "Ishdan ketish qayd etildi", attendance });
            } else {
                return res.status(400).json({ message: "Bugungi ish allaqachon yakunlangan" });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Abyom ish qo'shish
    static async addPieceWork(req, res) {
        const { attendanceId, pieceWorkData } = req.body;
        try {
            const attendance = await Attendance.findById(attendanceId);
            if (!attendance || attendance.workType !== 'piecework') {
                return res.status(404).json({ error: "Abyom ishchi topilmadi" });
            }

            attendance.pieceWorks.push(pieceWorkData);
            attendance.pieceWorkTotal = attendance.pieceWorks.reduce(
                (sum, work) => sum + work.totalPrice,
                0
            );
            attendance.status = 'completed';

            await attendance.save();
            return res.status(200).json({ message: "Ish qo'shildi", attendance });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Attendance ni _id bo'yicha olish
    static async getAttendanceById(req, res) {
        const { id } = req.params;
        try {
            const attendance = await Attendance.findById(id).populate('workerId');
            if (!attendance) {
                return res.status(404).json({ error: "Attendance topilmadi" });
            }
            return res.status(200).json({ message: "Attendance topildi", attendance });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AttendanceController;