const { checkSchema, validationResult } = require('express-validator');
const { invalidParamsError } = require('../errors');

const formatValidationErrors = validationErrors =>
  validationErrors.array({ onlyFirstError: true }).map(e => e.msg);

const throwValidationErrors = (req, _, next) => {
  const validationErrors = validationResult(req);
  return next(!validationErrors.isEmpty() && invalidParamsError(formatValidationErrors(validationErrors)));
};

const validateSchema = schema => checkSchema(schema);

exports.validateSchemaAndFail = schema => [validateSchema(schema), throwValidationErrors];
