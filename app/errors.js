const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DATABASE_ERROR = 'database_error';
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

exports.INTERNAL_SERVER_ERROR = 'internal_server_error';
exports.internalServerError = message => internalError(message, exports.INTERNAL_SERVER_ERROR);

exports.ALREADY_EXIST_ERROR = 'already_exist';
exports.alreadyExistError = message => internalError(message, exports.ALREADY_EXIST_ERROR);
