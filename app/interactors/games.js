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

const getValuesWhenIsFlag = ({ cells, x, y, flag }) => {
  const sortedValues = Object.values(
    groupBy(sortBy(cells, ['dataValues.y', 'dataValues.x']), 'dataValues.y')
  );
  return sortedValues.map(row =>
    row.map(({ dataValues }) => {
      const samePosition = isSamePosition(dataValues, { x: x - 1, y: y - 1 });
      if (samePosition) return flag;
      return dataValues.visible ? dataValues.value || dataValues.minesNear : null;
    })
  );
};

const updateFlag = ({ game, flag, x, y, transaction }) =>
  updateCell({
    data: { visible: true, value: flag },
    options: { where: { id: getCellByPosition({ cells: game.cells, x: x - 1, y: y - 1 }).id }, transaction }
  }).then(() => ({
    values: getValuesWhenIsFlag({ x, y, flag, cells: game.cells }),
    lost: false,
    game: game.dataValues
  }));

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

// eslint-disable-next-line complexity,max-statements
exports.playGame = async ({ gameId, x, y, flag }) => {
  let transaction = undefined;
  try {
    const game = await findGameWithCellsBy({ id: gameId });
    if (game.width < x || game.height < y) throw invalidCoordinatesError();
    transaction = await sequelize.transaction();
    const isValidFlag = flag || isNull(flag);
    if (isValidFlag) {
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
      const valueToUpdate = isValidFlag ? { value: flag } : { value: selectedCell.value };
      await updateCell({
        data: { visible: true, ...valueToUpdate },
        options: { where: { id: selectedCell.id }, transaction }
      });
      transaction.commit();
      const { won, values: finallyValues } = await checkAndUpdateGameWasWon(game);
      const isOrContainFlag = isValidFlag || selectedCell.value;
      return {
        values:
          finallyValues || !isOrContainFlag
            ? finallyValues || cellValues
            : getValuesWhenIsFlag({ x, y, flag: flag || selectedCell.value, cells: game.cells }),
        lost,
        game: game.dataValues,
        won
      };
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
