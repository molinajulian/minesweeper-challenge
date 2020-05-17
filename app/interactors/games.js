const { sequelize } = require('../models');
const { createGame } = require('../services/games');
const { getCellsPopulated, bulkCreateCells } = require('../services/cells');
const logger = require('../logger');
const { internalServerError } = require('../errors');

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
