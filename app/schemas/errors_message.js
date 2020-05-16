const genericMessage = ({ property, location = 'body', type = 'string' }) =>
  `${property} must be ${type}, not empty and must be contained in ${location}`;

module.exports = {
  EMAIL: genericMessage({ property: 'email' }),
  PASSWORD: genericMessage({ property: 'password' })
};
