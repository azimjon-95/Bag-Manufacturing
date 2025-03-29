const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const materialValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 50 },
      code: { type: "string" },
      unit: {
        type: "string",
        enum: ["kg", "piece", "meter", "liter", "roll"],
      },
      quantity: { type: "number", minimum: 0 },
      supplier: { type: "string", minLength: 2, maxLength: 100 },
      receivedDate: { type: "string", format: "date-time" }, // ISO formatdagi sana,
      stock: { type: "number", minimum: 0 },
    },
    required: ["name", "code", "unit", "quantity", "supplier"],
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "Material nomi kiritish shart",
        code: "Material kodi kiritish shart",
        unit: "O‘lchov birligi kiritish shart",
        quantity: "Miqdor kiritish shart",
        supplier: "Yetkazib beruvchi kiritish shart",
      },
      properties: {
        name: "Material nomi 2-50 ta belgi oralig‘ida bo‘lishi kerak",
        code: "Material kodi kiritish kerak",
        unit: "O‘lchov birligi faqat kg, piece, meter, liter yoki roll bo‘lishi mumkin",
        quantity: "Miqdor 0 dan kam bo‘lmasligi kerak",
        supplier:
          "Yetkazib beruvchi nomi 2-100 ta belgi oralig‘ida bo‘lishi kerak",
        receivedDate: "Sana noto‘g‘ri formatda, masalan: 2025-03-26T10:00:00Z",
      },
      // additionalProperties: "Ruxsat etilmagan maydon kiritildi",
    },
  };

  const validate = ajv.compile(schema);
  const result = validate(req.body);
  if (!result) {
    let errorField =
      validate.errors[0].instancePath.replace("/", "") || "Umumiy";
    let errorMessage = validate.errors[0].message;
    return response.error(res, `${errorField} xato: ${errorMessage}`);
  }
  next();
};

module.exports = materialValidation;
