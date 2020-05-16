const { hash, compare, genSalt } = require('bcryptjs');

const logger = require('../logger');
const { internalServerError } = require('../errors');
const { hashingSalts } = require('../../config').common.server;

exports.hashPassword = password => {
  logger.info('Getting hashing salts');
  return genSalt(parseInt(hashingSalts))
    .then(salt => {
      logger.info('Hashing salts obtained successfully');
      logger.info('Hashing password');
      return hash(password, salt);
    })
    .catch(error => {
      logger.error('Error hashing the password, details:', error);
      throw internalServerError(error.message);
    });
};

exports.comparePassword = (password, hashedPassword) => {
  logger.info('Hashing the password');
  return compare(password, hashedPassword).catch(error => {
    logger.error('Error comparing the passwords, details:', error);
    throw internalServerError(error.message);
  });
};
