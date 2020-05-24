const logger = require('../logger');
const { Game, Cell } = require('../models');
const { databaseError } = require('../errors');
const {
  GAMES_STATES: { STARTED }
} = require('../constants');

exports.createGame = (gameData, options) => {
  logger.info('Attempting to create game with data', gameData);
  return Game.create(gameData, options).catch(error => {
    logger.error('Error creating the game, reason:', error);
    throw databaseError(error.message);
  });
};

exports.findGameWithCellsBy = options => {
  logger.info('Attempting to get game with data', options);
  return Game.findOne({
    where: { ...options, state: STARTED },
    include: [{ model: Cell, as: 'cells', order: ['x', 'y'] }]
  }).catch(error => {
    logger.error('Error creating the game, reason:', error);
    throw databaseError(error.message);
  });
};

exports.updateGame = ({ options, data }) => {
  logger.info('Attempting to update game with data', data);
  return Game.update(data, { where: options }).catch(error => {
    logger.error('Error updating the cell, reason:', error);
    throw databaseError(error.message);
  });
};
