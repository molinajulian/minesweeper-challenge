const { VALID_FLAGS } = require('../constants');

const genericMessage = ({ property, location = 'body', type = 'string' }) =>
  `${property} must be ${type}, not empty and must be contained in ${location}`;

module.exports = {
  EMAIL: genericMessage({ property: 'email' }),
  PASSWORD: genericMessage({ property: 'password' }),
  HEIGHT: genericMessage({ property: 'height', type: 'integer' }),
  WEIGHT: genericMessage({ property: 'weight', type: 'integer' }),
  MINES_AMOUNT: genericMessage({ property: 'mines_amount', type: 'integer' }),
  X_POSITION: genericMessage({ property: 'x', type: 'integer' }),
  Y_POSITION: genericMessage({ property: 'y', type: 'integer' }),
  GAME_ID: genericMessage({ property: 'gamed id', type: 'integer', location: 'path' }),
  FLAG: `flag must be string or null, contained in body and one of ${Object.values(VALID_FLAGS).join(',')}`
};
