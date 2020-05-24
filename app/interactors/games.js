const { groupBy, sortBy, isNull } = require('lodash');

const { sequelize } = require('../models');
const { createGame, findGameWithCellsBy, updateGame } = require('../services/games');
const { getCellsPopulated, bulkCreateCells, bulkUpdateCells, updateCell } = require('../services/cells');
const logger = require('../logger');
const { internalServerError, notFoundError, invalidCoordinatesError } = require('../errors');
const { getCellByPosition, isSamePosition, discoverCell } = require('../utils/cells');
const {
  GAMES_STATES: { FINISHED }
} = require('../constants');

exports.createGame = async gameData => {
  const transaction = await sequelize.transaction();
  logger.info('Beginning the transaction');
  try {
    const game = await createGame(gameData, { transaction });
    logger.info('Game created successfully');
    logger.info('Attempting to create cells');
    const cellsToCreate = await getCellsPopulated(game);
    await bulkCreateCells(cellsToCreate, { transaction });
    logger.info('Cells created successfully');
    transaction.commit();
    return game;
  } catch (error) {
    logger.error('Error creating the game, reason:', error);
    transaction.rollback();
    if (error.internalCode) throw error;
    throw internalServerError(error.message);
  }
};

exports.playGame = ({ gameId, x, y, flag }) =>
  findGameWithCellsBy({ id: gameId }).then(game => {
    if (!game) throw notFoundError('The provided game was not found');
    if (game.width < x || game.height < y) throw invalidCoordinatesError();
    if (flag || isNull(flag)) {
      const sortedValues = Object.values(
        groupBy(sortBy(game.cells, ['dataValues.x', 'dataValues.y']), 'dataValues.x')
      );
      const values = sortedValues.map(row =>
        row.map(({ dataValues }) => {
          const samePosition = isSamePosition(dataValues, { x: x - 1, y: y - 1 });
          if (samePosition) return flag;
          return dataValues.visible ? dataValues.flag || dataValues.minesNear : null;
        })
      );
      return updateCell({
        data: { visible: true, flag },
        options: { id: getCellByPosition({ cells: game.cells, x, y }).id }
      }).then(() => ({ values, lost: false, game: game.dataValues }));
    }
    return discoverCell({ x: x - 1, y: y - 1, game, flag }).then(
      ({ lost, cellIdsToUpdate, selectedCell, values }) => {
        const cellValues = Object.values(groupBy(sortBy(values, ['x', 'y']), 'x')).map(row =>
          row.map(({ value }) => value)
        );
        if (lost) {
          return updateGame({ options: { id: game.id }, data: { state: FINISHED } }).then(() => ({
            values: cellValues,
            lost,
            game: game.dataValues
          }));
        }
        if (!cellIdsToUpdate) {
          return updateCell({ data: { visible: true }, options: { id: selectedCell.id } }).then(() => ({
            values: cellValues,
            lost,
            game: game.dataValues
          }));
        }
        return bulkUpdateCells(cellIdsToUpdate, selectedCell, flag).then(() => ({
          values: cellValues,
          lost,
          game: game.dataValues
        }));
      }
    );
  });
