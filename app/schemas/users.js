const { EMAIL, PASSWORD } = require('./errors_message');

exports.createUserSchema = {
  email: {
    in: ['body'],
    isString: true,
    trim: true,
    isEmail: true,
    isLength: { options: { min: 1 } },
    errorMessage: EMAIL
  },
  password: { in: ['body'], isString: true, isLength: { options: { min: 1 } }, errorMessage: PASSWORD }
};
