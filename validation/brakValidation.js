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
          minLength: "Nomi bo'sh bo'lishi mumkin emas",
        },
      },
      warehouseId: {
        type: "string",
        errorMessage: {
          type: "WarehouseId string bo'lishi kerak",
          format: "WarehouseId noto'g'ri formatda",
        },
      },
      quantity: {
        type: "number",
        minimum: 1,
        errorMessage: {
          type: "Miqdor son bo'lishi kerak",
          minimum: "Miqdor 1 dan kam bo'lishi mumkin emas",
        },
      },
      type: {
        type: "string",
        enum: ["product", "material"],
        errorMessage: {
          enum: "Tur faqat 'product' yoki 'material' bo'lishi kerak",
        },
      },
      reason: {
        type: "string",
        minLength: 1,
        errorMessage: {
          type: "Sabab string bo'lishi kerak",
          minLength: "Sabab bo'sh bo'lishi mumkin emas",
        },
      },
      associated_id: {
        type: "string",
        errorMessage: {
          type: "AsosiyId string bo'lishi kerak",
          format: "AsosiyId noto'g'ri formatda",
        },
      },
    },
    required: [
      "name",
      "warehouseId",
      "quantity",
      "type",
      "reason",
      "associated_id",
    ],
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "Nomi kiritish majburiy",
        warehouseId: "OmborId kiritish majburiy",
        quantity: "Miqdor kiritish majburiy",
        type: "Tur kiritish majburiy",
        reason: "Sababi kiritish majburiy",
        associated_id: "AsosiyId kiritish majburiy",
      },
      additionalProperties: "Qo'shimcha xususiyatlarga ruxsat berilmaydi",
    },
  };

  const validate = ajv.compile(brakSchema);
  const result = validate(req.body);

  if (!result) {
    let errorMessage = validate.errors[0].message;
    return response.error(res, `Xato: ${errorMessage}`);
  }

  next();
};

module.exports = brakValidation;
