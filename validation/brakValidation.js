const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const brakValidation = (req, res, next) => {
  const brakSchema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 1,
        errorMessage: {
          type: "Nomi string bo'lishi kerak",
          minLength: "Nomi bo'sh bo'lmasligi kerak",
        },
      },
      warehouseId: {
        type: "string",
        format: "objectId",
        errorMessage: {
          type: "OmborId string bo'lishi kerak",
          format: "OmborId  objectId (mongoDB _id) formatida bo'lishi kerak",
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
      type: {
        type: "string",
        enum: ["product", "material"],
        errorMessage: {
          enum: "Tur faqat 'product' yoki 'material' bo'lishi mumkin",
        },
      },
      reason: {
        type: "string",
        minLength: 1,
        errorMessage: {
          type: "Sababi string bo'lishi kerak",
          minLength: "Sababi bo'sh bo'lmasligi kerak",
        },
      },
    },
    required: ["name", "warehouseId", "quantity", "type", "reason"],
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "Nomi kiritish majburiy",
        warehouseId: "OmborId kiritish majburiy",
        quantity: "Miqdor kiritish majburiy",
        type: "Tur kiritish majburiy",
        reason: "Sababi kiritish majburiy",
      },
      additionalProperties: "Qo'shimcha xususiyatlarga ruxsat berilmaydi",
    },
  };
  const validate = ajv.compile(brakSchema);
  const result = validate(req.body);
  if (!result) {
    let errorField = validate.errors[0].instancePath.replace("/", "");
    let errorMessage = validate.errors[0].message;
    return response.error(res, `${errorField} xato: ${errorMessage}`);
  }
  next();
};

module.exports = brakValidation;
