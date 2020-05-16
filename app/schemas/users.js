const { EMAIL, PASSWORD } = require('./errors_message');

exports.createUserSchema = {
  email: { in: ['body'], isString: true, trim: true, isEmail: true, errorMessage: EMAIL },
  password: { in: ['body'], isString: true, errorMessage: PASSWORD }
};
