const { promisifyAll } = require('bluebird');
const { signAsync } = promisifyAll(require('jsonwebtoken'));

const { expirationValue, secretKey } = require('../../config').common.session;
const { internalServerError } = require('../errors');
const logger = require('../logger');

exports.sign = userId => {
  logger.info('Generating the session token');
  return signAsync({ sub: `${userId}}` }, secretKey, {
    expiresIn: parseInt(expirationValue)
  }).catch(error => {
    logger.error('Error generating the token, reason:', error);
    throw internalServerError(error.message);
  });
};
