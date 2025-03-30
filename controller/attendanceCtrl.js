const Worker = require('../model/workersModel');

class Attendance {
    static checkIn = [async (req, res) => {
        try {
            const { workerId } = req.body;
            const worker = await Worker.findById(workerId);

            if (!worker || !worker.isActive) {
                return res.status(404).json({ message: 'Работник не найден или не активен' });
            }

            const attendance = await Attendance.create({
                workerId,
                startTime: new Date()
            });

            res.json(attendance);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }];

    static checkOut = [async (req, res) => {
        try {
            const { taskCount } = req.body;
            const attendance = await Attendance.findById(req.params.id);
            if (!attendance) return res.status(404).json({ message: 'Запись не найдена' });

            const worker = await Worker.findById(attendance.workerId);
            const endTime = new Date();
            const totalHours = (endTime - attendance.startTime) / (1000 * 60 * 60);

            let dailySalary = 0;
            if (worker.workType === 'hourly') {
                dailySalary = totalHours * worker.rate;
            } else if (worker.workType === 'daily') {
                dailySalary = worker.rate;
            } else if (worker.workType === 'task') {
                attendance.taskCount = taskCount || 0;
                dailySalary = attendance.taskCount * worker.rate;
            }

            Object.assign(attendance, { endTime, totalHours, dailySalary });
            await attendance.save();

            res.json(attendance);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }];

    static getById = [async (req, res) => {
        try {
            const { workerId } = req.params;
            const { month, year } = req.query;
            if (!month || !year) return res.status(400).json({ message: 'Месяц и год обязательны' });

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const attendances = await Attendance.find({
                workerId,
                startTime: { $gte: startDate, $lte: endDate }
            }).populate('workerId', 'fullname phone workType rate');

            const report = attendances.reduce((acc, att) => {
                acc.totalSalary += att.dailySalary || 0;
                acc.totalHours += att.totalHours || 0;
                acc.totalTasks += att.taskCount || 0;
                acc.details.push(att);
                return acc;
            }, { totalSalary: 0, totalHours: 0, totalTasks: 0, details: [] });

            res.json(report);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }];
}

module.exports = Attendance;
