const { findCreateUser } = require('../services/users');
const { hashPassword } = require('../services/bcrypt');
const logger = require('../logger');

exports.signup = ({ body: { email, password } }, res, next) =>
  hashPassword(password)
    .then(hashedPassword => {
      logger.info('Password hashed successfully');
      return findCreateUser({ email, password: hashedPassword }).then(({ id }) => {
        logger.info('User created successfully');
        return res.status(201).send({ id });
      });
    })
    .catch(next);
