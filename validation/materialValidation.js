const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const Response = require("../utils/response");

const materialSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      errorMessage: "Material nomi bo'sh bo'lishi mumkin emas",
    },
    units: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          unit: {
            type: "string",
            enum: ["kg", "piece", "meter", "liter", "roll", "package"],
            errorMessage:
              "Unit faqat: 'kg', 'piece', 'meter', 'liter', 'roll', 'package' bo'lishi mumkin",
          },
          quantity: {
            type: "number",
            minimum: 0,
            errorMessage: "Quantity 0 dan kichik bo'lmasligi kerak",
          },
          inPackage: {
            type: "number",
            minimum: 0,
            errorMessage: "InPackage 0 dan kichik bo'lmasligi kerak",
          },
        },
        required: ["unit", "quantity"],
        additionalProperties: false,
      },
      errorMessage: {
        minItems: "Kamida bitta unit kerak",
      },
    },

    currency: {
      type: "string",
      enum: ["sum", "dollar"],
      errorMessage: "Valyuta faqat 'sum' yoki 'dollar' bo'lishi mumkin",
    },
    price: {
      type: "number",
      minimum: 0,
      errorMessage: "Narx 0 dan kichik bo'lmasligi kerak",
    },
    category: {
      type: "string",
      nullable: true,
    },
    yagonaId: {
      type: "string",
      nullable: true,
    },
    supplier: {
      type: "string",
    },
    warehouseId: {
      type: "string",
      pattern: "^[0-9a-fA-F]{24}$",
      errorMessage: "warehouseId noto‘g‘ri formatda (ObjectId bo‘lishi kerak)",
    },
  },
  required: ["name", "units", "currency", "price", "supplier", "warehouseId"],
  additionalProperties: false,
  errorMessage: {
    required: {
      name: "Material nomi majburiy",
      units: "Unit majburiy",
      currency: "Valyuta majburiy",
      price: "Narx majburiy",
      supplier: "Taminotchi ma'lumotlari majburiy",
      warehouseId: "WarehouseId majburiy",
    },
    additionalProperties: "Qo‘shimcha xususiyatlarga ruxsat berilmaydi",
  },
};

const validateMaterial = (req, res, next) => {
  const validate = ajv.compile(materialSchema);
  const valid = validate(req.body);

  if (!valid) {
    const errors = validate.errors.map((err) => ({
      field:
        err.instancePath.replace("/", "") ||
        err.params.missingProperty ||
        "unknown",
      message: err.message,
    }));
    return Response.error(res, "Validatsiya xatosi", errors);
  }

  next();
};

module.exports = validateMaterial;
