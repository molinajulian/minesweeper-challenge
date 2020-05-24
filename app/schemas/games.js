const { isString } = require('validator');
const { isNull } = require('lodash');

const { HEIGHT, WEIGHT, MINES_AMOUNT, X_POSITION, Y_POSITION, GAME_ID, FLAG } = require('./errors_message');
const { VALID_FLAGS } = require('../constants');

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

exports.playGameSchema = {
  x: {
    in: ['body'],
    isInt: true,
    toInt: { options: { min: 1, max: 9223372036854775807 } },
    errorMessage: X_POSITION
  },
  y: {
    in: ['body'],
    isInt: true,
    toInt: { options: { min: 1, max: 9223372036854775807 } },
    errorMessage: Y_POSITION
  },
  gameId: {
    in: ['params'],
    isInt: true,
    toInt: { options: { min: 1, max: 9223372036854775807 } },
    errorMessage: GAME_ID
  },
  flag: {
    in: ['body'],
    custom: {
      options: value => isNull(value) || (value && Object.values(VALID_FLAGS).includes(value.toLowerCase()))
    },
    optional: true,
    errorMessage: FLAG
  }
};
