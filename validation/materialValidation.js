// middleware/warehouseValidation.js
const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const Response = require("../utils/response");

// Warehouse validation schema
const warehouseSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      errorMessage: {
        type: "Ombor nomi string bo'lishi kerak",
        minLength: "Ombor nomi bo'sh bo'lmasligi kerak",
      },
    },
    description: {
      type: "string",
      errorMessage: {
        type: "Tavsif string bo'lishi kerak",
      },
    },
    category: {
      type: "string",
      enum: ["Tayyor maxsulotlar", "Homashyolar"],
      errorMessage: {
        type: "Kategoriya string bo'lishi kerak",
        enum: "Kategoriya 'Tayyor maxsulotlar' yoki 'Homashyolar' bo'lishi kerak",
      },
    },
    materials: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            errorMessage: {
              type: "Material nomi string bo'lishi kerak",
              minLength: "Material nomi bo'sh bo'lmasligi kerak",
            },
          },
          unit: {
            type: "string",
            enum: ["kg", "piece", "meter", "liter", "roll"],
            errorMessage: {
              type: "O'lchov birligi string bo'lishi kerak",
              enum: "O'lchov birligi 'kg', 'piece', 'meter', 'liter', yoki 'roll' bo'lishi kerak",
            },
          },
          quantity: {
            type: "number",
            minimum: 0,
            errorMessage: {
              type: "Miqdor raqam bo'lishi kerak",
              minimum: "Miqdor 0 dan kam bo'lmasligi kerak",
            },
          },
          price: {
            type: "number",
            errorMessage: {
              type: "Narx raqam bo'lishi kerak",
            },
          },
          category: {
            type: "string",
            errorMessage: {
              type: "Material kategoriyasi string bo'lishi kerak",
            },
          },
        },
        required: ["name", "unit", "quantity", "price"],
        additionalProperties: false,
      },
    },
  },
  required: ["name", "category"],
  additionalProperties: false,
};

// Validation middleware for creating/updating warehouse
const validateWarehouse = (req, res, next) => {
  const validate = ajv.compile(warehouseSchema);
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

// Validation middleware for adding material
const validateMaterial = (req, res, next) => {
  const materialSchema = warehouseSchema.properties.materials.items;
  const validate = ajv.compile(materialSchema);
  const valid = validate(req.body);

  if (!valid) {
    const errors = validate.errors.map(err => ({
      field: err.instancePath.replace('/', ''),
      message: err.message,
    }));
    return Response.error(res, "Material validatsiya xatosi", errors);
  }
  next();
};

module.exports = {
  validateWarehouse,
  validateMaterial,
};