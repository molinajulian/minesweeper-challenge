const Datetime = require('luxon').DateTime;

const errors = require('../errors');
const logger = require('../logger');

const DEFAULT_STATUS_CODE = 500;

const statusCodes = {
  [errors.DATABASE_ERROR]: 503,
  [errors.DEFAULT_ERROR]: DEFAULT_STATUS_CODE,
  [errors.INTERNAL_SERVER_ERROR]: 500,
  [errors.ALREADY_EXIST_ERROR]: 400,
  [errors.INVALID_PARAMS]: 409,
  [errors.NOT_FOUND]: 404,
  [errors.INVALID_CREDENTIALS]: 400,
  [errors.UNAUTHORIZED]: 401,
  [errors.INVALID_COORDINATES]: 400
};

exports.handle = (error, req, res, next) => {
  if (error.internalCode) res.status(statusCodes[error.internalCode] || DEFAULT_STATUS_CODE);
  else {
    next(error);
    res.status(DEFAULT_STATUS_CODE);
  }
  logger.error(error);
  return res.send({
    message: error.message,
    internal_code: error.internalCode,
    timestamp: Datetime.local().toISO()
  });
};
