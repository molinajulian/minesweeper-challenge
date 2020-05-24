const logger = require('../logger');
const { Cell, sequelize } = require('../models');
const { databaseError } = require('../errors');
const { getMines, isSamePosition, getMinesNear } = require('../utils/cells');

exports.getCellsPopulated = game => {
  logger.info('Obtaining coordinates for mines');
  const mines = getMines(game.minesAmount, game.height, game.width);
  logger.info('Coordinates obtained successfully');
  logger.info('Generating cells with empty values');
  const cells = Array.from(Array(game.width).keys(), () =>
    Array.from(Array(game.height).keys()).map(() => ({}))
  );
  logger.info('Cells generated successfully');
  logger.info('Populating cells');
  const cellsToCreate = cells.map((column, yPosition) =>
    column.map((value, xPosition) => {
      const isMine = mines.some(minePosition => isSamePosition(minePosition, { x: xPosition, y: yPosition }));
      const minesNear = getMinesNear({ xPosition, yPosition, mines, height: game.height, width: game.width });
      return { isMine, minesNear, x: xPosition, y: yPosition, visible: false, gameId: game.id };
    })
  );
  logger.info('Cells populated successfully');
  return cellsToCreate;
};

exports.bulkCreateCells = (cells, options) => {
  logger.info('Attempting to create multiple cells');
  const cellsToCreate = cells
    .reduce((previous, current) => previous.concat(current), [])
    .map(cell => ({ ...cell, createdAt: sequelize.fn('NOW'), updatedAt: sequelize.fn('NOW') }));
  return Cell.bulkCreate(cellsToCreate, options).catch(error => {
    logger.error('Error creating multiple cells, reason:', error);
    databaseError(error.message);
  });
};

exports.bulkUpdateCells = async (cellIds, selectedCell, flag) => {
  const transaction = await sequelize.transaction();
  const cellsToUpdate =
    (cellIds && cellIds.map(id => Cell.update({ visible: true }, { where: { id }, transaction }))) || [];
  try {
    selectedCell.update({ visible: true, flag }, { transaction });
    await Promise.all(cellsToUpdate);
    transaction.commit();
  } catch (e) {
    logger.error(e);
    transaction.rollback();
    throw databaseError(`Error updating the cells,reason: ${e.message}`);
  }
};

exports.updateCell = ({ options, data }) => {
  logger.info('Attempting to update cell with data', data);
  return Cell.update(data, { where: options }).catch(error => {
    logger.error('Error updating the cell, reason:', error);
    throw databaseError(error.message);
  });
};
