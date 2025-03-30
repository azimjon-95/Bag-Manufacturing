// models/Worker.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    date: { type: Date, default: Date.now },
    startTime: { type: Date },
    endTime: { type: Date },
    totalHours: { type: Number },
    taskCount: { type: Number, default: 0 }, // Для ishbay типа
    dailySalary: { type: Number },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);