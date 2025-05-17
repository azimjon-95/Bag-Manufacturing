const mongoose = require("mongoose");
const PieceWorkSchema = require("./PieceWork");

const AttendanceSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    workType: {
      type: String,
      enum: ["hourly", "daily", "piecework"],
      required: true,
    },
    startTime: { type: Date },
    endTime: { type: Date },
    totalHours: { type: Number },
    hourlyWage: { type: Number, default: 0 },
    dailySalary: { type: Number, default: 0 },
    pieceWorks: [PieceWorkSchema],
    pieceWorkTotal: {
      type: Number,
      default: function () {
        return this.pieceWorks.reduce((sum, work) => sum + work.totalPrice, 0);
      },
    },
    status: {
      type: String,
      enum: ["arrived", "left", "completed"],
      default: "arrived",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
