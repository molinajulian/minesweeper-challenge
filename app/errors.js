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

exports.INVALID_PARAMS = 'invalid_params';
exports.invalidParamsError = message => internalError(message, exports.INVALID_PARAMS);

exports.NOT_FOUND = 'not_found';
exports.notFoundError = message => internalError(message, exports.NOT_FOUND);

exports.INVALID_CREDENTIALS = 'invalid_credentials';
exports.invalidCredentialsError = message => internalError(message, exports.INVALID_CREDENTIALS);

exports.UNAUTHORIZED = 'unauthorized';
exports.unauthorized = () =>
  internalError('The provided user is not authorized for access to the resource', exports.UNAUTHORIZED);
