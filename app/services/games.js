const { groupBy, sortBy } = require('lodash');

const logger = require('../logger');
const { Game, Cell } = require('../models');
const { databaseError, notFoundError } = require('../errors');
const {
  GAMES_STATES: { STARTED, FINISHED },
  VALID_FLAGS: { EXCLAMATION_MARK },
  MINE_NOT_FOUND_FLAG
} = require('../constants');
const { isSamePosition } = require('../utils/cells');

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
  })
    .catch(error => {
      logger.error('Error creating the game, reason:', error);
      throw databaseError(error.message);
    })
    .then(game => {
      if (!game) throw notFoundError('The provided game was not found');
      return game;
    });
};

exports.updateGame = ({ options, data }) => {
  logger.info('Attempting to update game with data', data);
  return Game.update(data, { ...options }).catch(error => {
    logger.error('Error updating the cell, reason:', error);
    throw databaseError(error.message);
  });
};

exports.checkAndUpdateGameWasWon = game =>
  exports.findGameWithCellsBy({ id: game.id }).then(gameReloaded => {
    const gameDimension = game.width * game.height;
    const minesNotDiscovered = gameReloaded.cells.filter(
      cell => !cell.dataValues.visible && cell.dataValues.isMine && !cell.dataValues.flag
    );
    const discoveredCells = gameReloaded.cells.filter(cell => cell.dataValues.visible);
    const discoveredAllCells =
      discoveredCells.length === gameDimension &&
      gameReloaded.cells.filter(cell => cell.value === EXCLAMATION_MARK && cell.isMine).length ===
        game.minesAmount;
    const gameWasWon =
      discoveredAllCells || discoveredCells.length + minesNotDiscovered.length === gameDimension;
    let finallyCellValues = undefined;
    if (gameWasWon && !discoveredAllCells) {
      finallyCellValues = Object.values(groupBy(sortBy(gameReloaded.cells, ['y', 'x']), 'y')).map(row =>
        row.map(({ value, minesNear, isMine, x, y }) => {
          const discoveredMine = isMine && value === EXCLAMATION_MARK;
          if (discoveredMine) return value;
          return minesNotDiscovered.some(cell => isSamePosition(cell.dataValues, { x, y }))
            ? MINE_NOT_FOUND_FLAG
            : minesNear;
        })
      );
    }
    const updateGameParams = { options: { where: { id: game.id } }, data: { state: FINISHED } };
    return gameWasWon
      ? this.updateGame(updateGameParams).then(() => ({
          won: gameWasWon,
          values: finallyCellValues
        }))
      : Promise.resolve({ won: gameWasWon, values: finallyCellValues });
  });
