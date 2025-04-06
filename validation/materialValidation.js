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
    unit: {
      type: "string",
      enum: ["kg", "piece", "meter", "liter", "roll"],
      errorMessage: "Unit faqat: 'kg', 'piece', 'meter', 'liter', 'roll' bo'lishi mumkin",
    },
    quantity: {
      type: "number",
      minimum: 0,
      errorMessage: "Quantity 0 dan kichik bo'lmasligi kerak",
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
      nullable: true,
    },
    receivedDate: {
      type: "string",
      format: "date-time",
      nullable: true,
    },
    warehouseId: {
      type: "string",
      pattern: "^[0-9a-fA-F]{24}$",
      errorMessage: "warehouseId noto‘g‘ri formatda (ObjectId bo‘lishi kerak)",
    },
  },
  required: ["name", "unit", "quantity", "price", "warehouseId"],
  additionalProperties: false,
  errorMessage: {
    required: {
      name: "Material nomi majburiy",
      unit: "Unit majburiy",
      quantity: "Quantity majburiy",
      price: "Narx majburiy",
      warehouseId: "WarehouseId majburiy",
    },
    additionalProperties: "Qo‘shimcha xususiyatlarga ruxsat berilmaydi",
  },
};

const validateMaterial = (req, res, next) => {
  const validate = ajv.compile(materialSchema);
  const valid = validate(req.body);

  if (!valid) {
    const errors = validate.errors.map(err => ({
      field: err.instancePath.replace('/', ''),
      message: err.message,
    }));
    return Response.error(res, "Validatsiya xatosi", errors);
  }

  next();
};

module.exports = validateMaterial;


