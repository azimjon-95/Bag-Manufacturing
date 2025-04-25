const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const Response = require("../utils/response");

const warehouseSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      errorMessage: {
        type: "Ombor nomi matn bo‘lishi kerak",
        minLength: "Ombor nomi bo‘sh bo‘lishi mumkin emas",
      },
    },
    description: {
      type: "string",
      nullable: true,
      errorMessage: {
        type: "Tavsif matn bo‘lishi kerak",
      },
    },
    category: {
      type: "string",
      enum: ["Tayyor maxsulotlar", "Homashyolar"],
      errorMessage: {
        enum: "Kategoriya faqat 'Tayyor maxsulotlar' yoki 'Homashyolar' bo‘lishi mumkin",
      },
    },
  },
  required: ["name", "category"],
  additionalProperties: false,
  errorMessage: {
    required: {
      name: "Ombor nomi majburiy",
      category: "Kategoriya majburiy",
    },
    additionalProperties: "Qo‘shimcha xususiyatlarga ruxsat berilmaydi",
  },
};

const validateWarehouse = (req, res, next) => {
  const validate = ajv.compile(warehouseSchema);
  const valid = validate(req.body);

  if (!valid) {
    const errors = validate.errors.map((err) => ({
      field: err.instancePath.replace("/", ""),
      message: err.message,
    }));
    return Response.error(res, "Validatsiya xatosi", errors);
  }

  next();
};

module.exports = validateWarehouse;
