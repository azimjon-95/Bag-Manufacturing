const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

// AttendanceSchema uchun validatsiya sxemasi
const attendanceScanSchema = {
    type: "object",
    properties: {
        workerId: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: "WorkerId string bo'lishi kerak",
                minLength: "WorkerId bo'sh bo'lmasligi kerak",
            },
        },
    },
    required: ["workerId"],
    additionalProperties: false,
    errorMessage: {
        required: {
            workerId: "WorkerId kiritish majburiy",
        },
        additionalProperties: "Faqat workerId kiritish mumkin",
    },
};

// PieceWork uchun validatsiya sxemasi
const pieceWorkSchema = {
    type: "object",
    properties: {
        attendanceId: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: "AttendanceId string bo'lishi kerak",
                minLength: "AttendanceId bo'sh bo'lmasligi kerak",
            },
        },
        pieceWorkData: {
            type: "object",
            properties: {
                taskName: {
                    type: "string",
                    minLength: 1,
                    errorMessage: {
                        type: "Vazifa nomi string bo'lishi kerak",
                        minLength: "Vazifa nomi bo'sh bo'lmasligi kerak",
                    },
                },
                quantity: {
                    type: "number",
                    minimum: 1,
                    errorMessage: {
                        type: "Miqdor raqam bo'lishi kerak",
                        minimum: "Miqdor 1 dan kam bo'lmasligi kerak",
                    },
                },
                unitPrice: {
                    type: "number",
                    minimum: 0,
                    errorMessage: {
                        type: "Birlik narxi raqam bo'lishi kerak",
                        minimum: "Birlik narxi manfiy bo'lmasligi kerak",
                    },
                },
            },
            required: ["taskName", "quantity", "unitPrice"],
            additionalProperties: false,
            errorMessage: {
                required: {
                    taskName: "Vazifa nomi kiritish majburiy",
                    quantity: "Miqdor kiritish majburiy",
                    unitPrice: "Birlik narxi kiritish majburiy",
                },
                additionalProperties: "Faqat taskName, quantity va unitPrice kiritish mumkin",
            },
        },
    },
    required: ["attendanceId", "pieceWorkData"],
    additionalProperties: false,
    errorMessage: {
        required: {
            attendanceId: "AttendanceId kiritish majburiy",
            pieceWorkData: "PieceWork ma'lumotlari kiritish majburiy",
        },
        additionalProperties: "Faqat attendanceId va pieceWorkData kiritish mumkin",
    },
};

// Validatsiya middleware
const validateAttendanceScan = (req, res, next) => {
    const validate = ajv.compile(attendanceScanSchema);
    const valid = validate(req.body);

    if (!valid) {
        const errors = validate.errors.map((err) => err.message);
        return response.error(res, "Validatsiya xatosi", errors, 400);
    }
    next();
};

const validatePieceWork = (req, res, next) => {
    const validate = ajv.compile(pieceWorkSchema);
    const valid = validate(req.body);

    if (!valid) {
        const errors = validate.errors.map((err) => err.message);
        return response.error(res, "Validatsiya xatosi", errors, 400);
    }
    next();
};

module.exports = { validateAttendanceScan, validatePieceWork };