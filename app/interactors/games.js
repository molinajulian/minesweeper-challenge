const { groupBy, sortBy, isNull } = require('lodash');

const { sequelize } = require('../models');
const {
  createGame,
  findGameWithCellsBy,
  updateGame,
  checkAndUpdateGameWasWon
} = require('../services/games');
const { getCellsPopulated, bulkCreateCells, bulkUpdateCells, updateCell } = require('../services/cells');
const logger = require('../logger');
const { internalServerError, invalidCoordinatesError } = require('../errors');
const { getCellByPosition, isSamePosition, discoverCell } = require('../utils/cells');
const {
  GAMES_STATES: { FINISHED },
  VALID_FLAGS: { EXCLAMATION_MARK },
  MINE_NOT_FOUND_FLAG
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

const updateFlag = ({ game, flag, x, y, transaction }) => {
  const sortedValues = Object.values(
    groupBy(sortBy(game.cells, ['dataValues.y', 'dataValues.x']), 'dataValues.y')
  );
  const values = sortedValues.map(row =>
    row.map(({ dataValues }) => {
      const samePosition = isSamePosition(dataValues, { x: x - 1, y: y - 1 });
      if (samePosition) return flag;
      return dataValues.visible ? dataValues.value || dataValues.minesNear : null;
    })
  );
  return updateCell({
    data: { visible: true, value: flag },
    options: { where: { id: getCellByPosition({ cells: game.cells, x: x - 1, y: y - 1 }).id }, transaction }
  }).then(() => ({ values, lost: false, game: game.dataValues }));
};

const getLostCellValues = values =>
  Object.values(groupBy(sortBy(values, ['y', 'x']), 'y')).map(row =>
    row.map(({ value, visible, minesNear, isMine }) => {
      const discoveredMine = isMine && value === EXCLAMATION_MARK;
      if (discoveredMine) return value;
      return isMine && !visible ? MINE_NOT_FOUND_FLAG : minesNear;
    })
  );

const getNormalCellValues = values =>
  Object.values(groupBy(sortBy(values, ['y', 'x']), 'y')).map(row =>
    row.map(({ value, visible, minesNear }) => (visible ? value || minesNear : value))
  );

// eslint-disable-next-line complexity
exports.playGame = async ({ gameId, x, y, flag }) => {
  let transaction = undefined;
  try {
    const game = await findGameWithCellsBy({ id: gameId });
    if (game.width < x || game.height < y) throw invalidCoordinatesError();
    transaction = await sequelize.transaction();
    if (flag || isNull(flag)) {
      const { values, game: gameDataValues } = await updateFlag({ game, flag, x, y, transaction });
      transaction.commit();
      const { won, values: finallyValues } = await checkAndUpdateGameWasWon(game);
      return {
        values: finallyValues || values,
        game: gameDataValues,
        lost: false,
        won
      };
    }
    const { lost, cellIdsToUpdate, selectedCell, values } = await discoverCell({
      x: x - 1,
      y: y - 1,
      game,
      flag
    });
    if (lost) {
      await updateGame({ options: { where: { id: game.id }, transaction }, data: { state: FINISHED } });
      const cellValuesWithMines = getLostCellValues(values);
      transaction.commit();
      return {
        values: cellValuesWithMines,
        lost,
        game: game.dataValues
      };
    }
    const cellValues = getNormalCellValues(values);
    if (!cellIdsToUpdate) {
      await updateCell({ data: { visible: true }, options: { where: { id: selectedCell.id }, transaction } });
      transaction.commit();
      const { won, values: finallyValues } = await checkAndUpdateGameWasWon(game);
      return { values: finallyValues || cellValues, lost, game: game.dataValues, won };
    }
    await bulkUpdateCells({ cellIdsToUpdate, selectedCell, flag, transaction });
    transaction.commit();
    const { won, values: finallyValues } = await checkAndUpdateGameWasWon(game);
    return { values: finallyValues || cellValues, lost, game: game.dataValues, won };
  } catch (error) {
    if (transaction) transaction.rollback();
    if (error.internalCode) throw error;
    throw internalServerError(error.message);
  }
};

// exports.playGame = ({ gameId, x, y, flag }) =>
//   findGameWithCellsBy({ id: gameId }).then(game => {
//     if (!game) throw notFoundError('The provided game was not found');
//     if (game.width < x || game.height < y) throw invalidCoordinatesError();
//     if (flag || isNull(flag)) {
//       return updateFlag({ game, flag, x, y }).then(({ values, game: gameDataValues }) =>
//         checkAndUpdateGameWasWon(game).then(({ won, values: finallyValues }) => ({
//           values: finallyValues || values,
//           game: gameDataValues,
//           lost: false,
//           won
//         }))
//       );
//     }
//     return discoverCell({ x: x - 1, y: y - 1, game, flag }).then(
//       ({ lost, cellIdsToUpdate, selectedCell, values }) => {
//         if (lost) {
//           return updateGame({ options: { id: game.id }, data: { state: FINISHED } }).then(() => {
//             const cellValuesWithMines = Object.values(groupBy(sortBy(values, ['y', 'x']), 'y')).map(row =>
//               row.map(({ value, visible, minesNear, isMine }) => {
//                 const discoveredMine = isMine && value === EXCLAMATION_MARK;
//                 if (discoveredMine) return value;
//                 return isMine && !visible ? MINE_NOT_FOUND_FLAG : minesNear;
//               })
//             );
//             return {
//               values: cellValuesWithMines,
//               lost,
//               game: game.dataValues
//             };
//           });
//         }
//         const cellValues = Object.values(groupBy(sortBy(values, ['y', 'x']), 'y')).map(row =>
//           row.map(({ value, visible, minesNear }) => (visible ? minesNear : value))
//         );
//         if (!cellIdsToUpdate) {
//           return updateCell({ data: { visible: true }, options: { id: selectedCell.id } }).then(() =>
//             checkAndUpdateGameWasWon(game).then(({ won, values: finallyValues }) => ({
//               values: finallyValues || cellValues,
//               lost,
//               game: game.dataValues,
//               won
//             }))
//           );
//         }
//       }
//     );
//   });
