const { promisifyAll } = require('bluebird');
const { signAsync, verifyAsync } = promisifyAll(require('jsonwebtoken'));

const { expirationValue, secretKey } = require('../../config').common.session;
const { internalServerError, unauthorized } = require('../errors');
const logger = require('../logger');

exports.sign = userId => {
  logger.info('Generating the session token');
  return signAsync({ sub: `${userId}` }, secretKey, {
    expiresIn: parseInt(expirationValue)
  }).catch(error => {
    logger.error('Error generating the token, reason:', error);
    throw internalServerError(error.message);
  });
};

exports.verify = token => {
  logger.info('Verifying the session token');
  return verifyAsync(token, secretKey).catch(error => {
    logger.error('Error verifying the token, reason:', error);
    if (error.name && error.name === 'JsonWebTokenError') throw unauthorized();
    throw internalServerError(error.message);
  });
};
