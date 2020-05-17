const logger = require('../logger');
const { Game } = require('../models');
const { databaseError } = require('../errors');

exports.createGame = (gameData, options) => {
  logger.info('Attempting to create game with data', gameData);
  return Game.create(gameData, options).catch(error => {
    logger.error('Error creating the game, reason:', error);
    databaseError(error.message);
  });
};
