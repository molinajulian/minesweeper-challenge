const genericMessage = ({ property, location = 'body', type = 'string' }) =>
  `${property} must be ${type}, not empty and must be contained in ${location}`;

module.exports = {
  EMAIL: genericMessage({ property: 'email' }),
  PASSWORD: genericMessage({ property: 'password' }),
  HEIGHT: genericMessage({ property: 'height', type: 'integer' }),
  WEIGHT: genericMessage({ property: 'weight', type: 'integer' }),
  MINES_AMOUNT: genericMessage({ property: 'mines_amount', type: 'integer' })
};
