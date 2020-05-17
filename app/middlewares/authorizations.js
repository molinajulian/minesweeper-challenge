const { headerName } = require('../../config').common.session;
const { unauthorized } = require('../errors');
const { verify } = require('../services/jwt');
const { findOneBy } = require('../services/users');

exports.checkToken = (req, res, next) => {
  if (!req.headers[headerName]) return next(unauthorized());
  return verify(req.headers[headerName])
    .then(decodedToken =>
      findOneBy({ id: decodedToken.sub }).then(user => {
        req.user = user;
        return next();
      })
    )
    .catch(next);
};
