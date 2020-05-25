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
    logger.info('Game founded. Checking coordinates');
    if (game.width < x || game.height < y) throw invalidCoordinatesError();
    logger.info('The coordinates are valid. Beginning the transaction');
    transaction = await sequelize.transaction();
    logger.info('Checking if is a flag');
    const isValidFlag = flag || isNull(flag);
    if (isValidFlag) {
      logger.info("It's a flag, updating the value in the cell");
      const { values, game: gameDataValues } = await updateFlag({ game, flag, x, y, transaction });
      logger.info('Cell updated. Attempting to commit the changes');
      transaction.commit();
      logger.info('The changes were committed. Checking if the game was win');
      const { won, values: finallyValues } = await checkAndUpdateGameWasWon(game);
      logger.info(`¿Did the game win? : ${won}`);
      return {
        values: finallyValues || values,
        game: gameDataValues,
        lost: false,
        won
      };
    }
    logger.info("It isn't a flag. Discovering the cells");
    const { lost, cellIdsToUpdate, selectedCell, values } = await discoverCell({
      x: x - 1,
      y: y - 1,
      game,
      flag
    });
    logger.info('The cells was discover correctly. Checking if the user lost the game');
    if (lost) {
      logger.info('The user lost the game. Updating the game');
      await updateGame({ options: { where: { id: game.id }, transaction }, data: { state: FINISHED } });
      logger.info('The game was updated successfully.Obtaining the finally values for the cells');
      const cellValuesWithMines = getLostCellValues(values);
      logger.info('Cell values were obtained successfully. Commiting the changes');
      transaction.commit();
      logger.info('The changes were committed successfully');
      return {
        values: cellValuesWithMines,
        lost,
        game: game.dataValues
      };
    }
    logger.info("The user didn't lost.Obtaining the cell values");
    const cellValues = getNormalCellValues(values);
    logger.info('The cell values were obtained successfully. Checking if exist only one cell to update');
    if (!cellIdsToUpdate) {
      logger.info(
        "It's a only cell to update. Checking if the cell already have a flag or if the user want to rollback a flag"
      );
      const valueToUpdate = isValidFlag ? { value: flag } : { value: selectedCell.value };
      logger.info('Updating the cell');
      await updateCell({
        data: { visible: true, ...valueToUpdate },
        options: { where: { id: selectedCell.id }, transaction }
      });
      logger.info('Attempting to commit the changes');
      transaction.commit();
      logger.info('The changes were committed. Checking if the user won the game');
      const { won, values: finallyValues } = await checkAndUpdateGameWasWon(game);
      logger.info(`¿Did the game win? : ${won}`);
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
    logger.info('Attempting to update many cells');
    await bulkUpdateCells({ cellIdsToUpdate, selectedCell, flag, transaction });
    logger.info('Attempting to commit the changes');
    transaction.commit();
    logger.info('The changes were committed successfuly');
    const { won, values: finallyValues } = await checkAndUpdateGameWasWon(game);
    logger.info(`¿Did the game win? : ${won}`);
    return { values: finallyValues || cellValues, lost, game: game.dataValues, won };
  } catch (error) {
    logger.error('There was an error playing the game', error);
    if (transaction) transaction.rollback();
    if (error.internalCode) throw error;
    throw internalServerError(error.message);
  }
};
