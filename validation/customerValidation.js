const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const customerValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      fullName: {
        type: "string",
        minLength: 1,
        errorMessage: "F.I.Sh. faqat harf va raqamlardan iborat bo'lishi kerak",
      },
      phoneNumber: {
        type: "string",
        minLength: 1,
        pattern: "^[0-9+\\-()\\s]{7,20}$", // oddiy raqamlar uchun pattern
        errorMessage: "Telefon raqami faqat raqamlardan iborat bo'lishi kerak",
      },
      address: {
        type: "string",
        errorMessage: "manzilni kiriting",
      },
    },
    required: ["fullName", "phoneNumber", "address"],
    additionalProperties: false,
    errorMessage: {
      required: {
        fullName: "F.I.Sh. kiritish majburiy",
        phoneNumber: "Telefon raqami kiritish majburiy",
        address: "Manzil kiritish majburiy",
      },
    },
  };

  const validate = ajv.compile(schema);
  const valid = validate(req.body);

  if (!valid) {
    const error = validate.errors[0];
    let field =
      error.instancePath.replace("/", "") || error.params.missingProperty;
    let message = error.message || "Noto'g'ri ma'lumot";
    return response.error(res, `${field} xato: ${message}`);
  }

  next();
};

module.exports = customerValidation;
