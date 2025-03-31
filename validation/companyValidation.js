const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

// CompanySchema uchun validatsiya sxemasi
const companySchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: "Kompaniya nomi string bo'lishi kerak",
                minLength: "Kompaniya nomi bo'sh bo'lmasligi kerak",
            },
        },
        address: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: "Manzil string bo'lishi kerak",
                minLength: "Manzil bo'sh bo'lmasligi kerak",
            },
        },
        defaultWorkingHours: {
            type: "object",
            properties: {
                start: {
                    type: "string",
                    pattern: "^([0-1][0-9]|2[0-3]):[0-5][0-9]$",
                    errorMessage: {
                        type: "Boshlanish vaqti string bo'lishi kerak",
                        pattern: "Boshlanish vaqti HH:MM formatida bo'lishi kerak (masalan, 08:00)",
                    },
                },
                end: {
                    type: "string",
                    pattern: "^([0-1][0-9]|2[0-3]):[0-5][0-9]$",
                    errorMessage: {
                        type: "Tugash vaqti string bo'lishi kerak",
                        pattern: "Tugash vaqti HH:MM formatida bo'lishi kerak (masalan, 17:00)",
                    },
                },
            },
            required: ["start", "end"],
            additionalProperties: false,
            errorMessage: {
                required: {
                    start: "Boshlanish vaqti kiritish majburiy",
                    end: "Tugash vaqti kiritish majburiy",
                },
                additionalProperties: "Faqat start va end kiritish mumkin",
            },
        },
    },
    required: ["name"],
    additionalProperties: false,
    errorMessage: {
        required: {
            name: "Kompaniya nomi kiritish majburiy",
        },
        additionalProperties: "Faqat name, address va defaultWorkingHours kiritish mumkin",
    },
};

// Validatsiya middleware
const validateCompany = (req, res, next) => {
    const validate = ajv.compile(companySchema);
    const valid = validate(req.body);

    if (!valid) {
        const errors = validate.errors.map((err) => err.message);
        return response.error(res, "Validatsiya xatosi", errors, 400);
    }
    next();
};

module.exports = validateCompany;