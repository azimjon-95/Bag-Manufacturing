const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

// JSON schema definition matching the Mongoose schema
const pieceValidationSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            errorMessage: {
                type: "Ism matn bo'lishi kerak",
                minLength: "Ism bo'sh bo'lmasligi kerak"
            }
        },
        price: {
            type: "number",
            minimum: 0,
            errorMessage: {
                type: "Narx raqam bo'lishi kerak",
                minimum: "Narx 0 dan kichik bo'lmasligi kerak"
            }
        },
        type: {
            type: "string",
            enum: ["Dona", "Metr", "Kvadrat"],
            default: "Dona",
            errorMessage: {
                enum: "Tur faqat 'Dona', 'Metr' yoki 'Kvadrat' bo'lishi mumkin"
            }
        }
    },
    required: ["name", "price"],
    additionalProperties: false,
    errorMessage: {
        required: {
            name: "Ism kiritish majburiy",
            price: "Narx kiritish majburiy"
        },
        additionalProperties: "Qo shimcha maydonlar qo shib bo lmaydi"
    }
};

// Validation middleware
const validatePiece = (req, res, next) => {
    const validate = ajv.compile(pieceValidationSchema);
    const valid = validate(req.body);

    if (!valid) {
        const errors = validate.errors.map(err => ({
            field: err.instancePath.replace('/', '') || err.params.missingProperty,
            message: err.message
        }));
        return response.error(res, "Ma'lumotlarni tekshirishda xatolik", errors, 400);
    }

    next();
};


module.exports = validatePiece;