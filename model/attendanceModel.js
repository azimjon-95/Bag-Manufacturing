const mongoose = require('mongoose');
const PieceWorkSchema = require('./PieceWork');

const AttendanceSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    workType: {
        type: String,
        enum: ['hourly', 'daily', 'piecework'],
        required: true
    },
    startTime: { type: Date },
    endTime: { type: Date },
    totalHours: {
        type: Number,
        default: function () {
            if (this.startTime && this.endTime) {
                return (this.endTime - this.startTime) / (1000 * 60 * 60);
            }
            return 0;
        }
    },
    hourlyWage: { type: Number, default: 0 },
    dailySalary: { type: Number, default: 0 },
    pieceWorks: [PieceWorkSchema],
    pieceWorkTotal: {
        type: Number,
        default: function () {
            return this.pieceWorks.reduce((sum, work) => sum + work.totalPrice, 0);
        }
    },
    status: {
        type: String,
        enum: ['arrived', 'left', 'completed'],
        default: 'arrived'
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);


