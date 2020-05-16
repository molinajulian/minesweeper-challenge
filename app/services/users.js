const logger = require('../logger');
const { User } = require('../models');
const { databaseError, alreadyExistError } = require('../errors');

exports.findCreateUser = userData => {
  logger.info('Attempting to create user with data', userData);
  return User.findOrCreate({ defaults: userData, where: { email: userData.email } })
    .catch(error => {
      logger.error('Error getting or createing user, reason:', error);
      databaseError(error.message);
    })
    .then(([user, created]) => {
      if (!created) throw alreadyExistError('The provided user already exist');
      return user.dataValues;
    });
};
