const logger = require('../logger');
const { findCreateUser, findOneBy } = require('../services/users');
const { hashPassword, comparePassword } = require('../services/bcrypt');
const { invalidCredentialsError } = require('../errors');
const { sign } = require('../services/jwt');

exports.signUp = ({ body: { email, password } }, res, next) =>
  hashPassword(password)
    .then(hashedPassword => {
      logger.info('Password hashed successfully');
      return findCreateUser({ email, password: hashedPassword }).then(({ id }) => {
        logger.info('User created successfully');
        return res.status(201).send({ id });
      });
    })
    .catch(next);

exports.signIn = ({ body: { email, password } }, res, next) =>
  findOneBy({ email })
    .then(user => {
      logger.info('User was found');
      return comparePassword(password, user.password).then(samePassword => {
        if (!samePassword) throw invalidCredentialsError('The provided credentials are invalid');
        return sign(user.id).then(token => res.status(200).send({ token }));
      });
    })
    .catch(next);
