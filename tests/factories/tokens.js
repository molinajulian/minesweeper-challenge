const { promisifyAll } = require('bluebird');
const { signAsync } = promisifyAll(require('jsonwebtoken'));
const { secretKey } = require('../../config').session;

module.exports = {
  generateToken: (userId = 1) => signAsync({ sub: `${userId}` }, secretKey)
};
