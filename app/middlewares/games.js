const { invalidParamsError } = require('../errors');

exports.checkGameInput = ({ body: { weight, height, mines_amount: minesAmount } }, res, next) => {
  if (minesAmount > weight * height) {
    return next(invalidParamsError('The provided mines_amount can not be greater than cells'));
  }
  return next();
};
