const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const workerValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      fullname: { type: "string", minLength: 2, maxLength: 50 },
      phone: {
        type: "string",
        // phone 9 ta raqam boladi
        pattern: "^[0-9]{9}$",
      },
      workType: {
        type: "string",
        enum: ["daily", "hourly", "piecework"], // kunbay, soatbay, ishbay
      },
      specialization: {
        type: "string",
      },
      rates: {
        type: "object",
        properties: {
          hourly: { type: "number", default: 0 },
          daily: { type: "number", default: 0 },
        },
      },
    },
    required: ["fullname", "phone", "specialization", "workType"],
    additionalProperties: false,
    errorMessage: {
      required: {
        fullname: "Ism-familiya kiritish shart",
        phone: "Telefon raqam kiritish shart",
        workType: "Ish turi kiritish shart",
      },
      properties: {
        fullname: "Ism-familiya 2-50 ta belgi oralig‘ida bo‘lishi kerak",
        phone: "Telefon raqam noto‘g‘ri formatda, masalan: 901234567",
        workType: "Ish turi faqat daily, hourly yoki task bo‘lishi mumkin",
      },
    },
  };

  const validate = ajv.compile(schema);
  const result = validate(req.body);
  if (!result) {
    let errorField = validate.errors[0].instancePath.replace("/", "");
    let errorMessage = validate.errors[0].message;
    return response.error(res, `${errorField} xato: ${errorMessage}`);
  }
  next();
};

module.exports = workerValidation;
