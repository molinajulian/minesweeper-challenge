const { HEIGHT, WEIGHT, MINES_AMOUNT } = require('./errors_message');

exports.createGameSchema = {
  height: {
    in: ['body'],
    isInt: {
      options: { min: 1, max: 9223372036854775807 }
    },
    toInt: true,
    errorMessage: HEIGHT
  },
  width: {
    in: ['body'],
    isInt: {
      options: { min: 1, max: 9223372036854775807 }
    },
    toInt: true,
    errorMessage: WEIGHT
  },
  mines_amount: {
    in: ['body'],
    isInt: {
      options: { min: 1, max: 9223372036854775807 }
    },
    toInt: true,
    errorMessage: MINES_AMOUNT
  }
};
