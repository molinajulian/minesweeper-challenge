const logger = require('../logger');
const {
  Cell,
  sequelize: { fn }
} = require('../models');
const { databaseError } = require('../errors');

const isSamePosition = (firstPosition, secondPosition) =>
  firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y;

const getRandomPositions = (xMax, yMax, array) => {
  const proposedPosition = { x: Math.ceil(Math.random() * xMax) - 1, y: Math.ceil(Math.random() * yMax) - 1 };
  if (array.some(position => isSamePosition(position, proposedPosition))) {
    return getRandomPositions(xMax, yMax, array);
  }
  return proposedPosition;
};

const getMines = (amount, height, width) => {
  const arrayOfMines = [];
  Array.from(Array(amount).keys()).forEach(() => {
    arrayOfMines.push(getRandomPositions(width, height, arrayOfMines));
  });
  return arrayOfMines;
};

const getMinesNear = (xPosition, yPosition, mines) => {
  const positionsAround = [
    { x: xPosition - 1, y: yPosition + 1 },
    { x: xPosition - 1, y: yPosition },
    { x: xPosition - 1, y: yPosition - 1 },
    { x: xPosition, y: yPosition - 1 },
    { x: xPosition, y: yPosition + 1 },
    { x: xPosition + 1, y: yPosition + 1 },
    { x: xPosition + 1, y: yPosition },
    { x: xPosition + 1, y: yPosition - 1 }
  ];
  const validPositionsAround = positionsAround.filter(({ x, y }) => x >= 0 && y >= 0);
  const amountMinesNear = validPositionsAround.filter(positionNear =>
    mines.some(minePosition => isSamePosition(positionNear, minePosition))
  );
  return (amountMinesNear && amountMinesNear.length) || 0;
};

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
  const cellsToCreate = cells.map((column, xPosition) =>
    column.map((value, yPosition) => {
      const isMine = mines.some(minePosition => isSamePosition(minePosition, { x: xPosition, y: yPosition }));
      const minesNear = getMinesNear(xPosition, yPosition, mines);
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
    .map(cell => ({ ...cell, createdAt: fn('NOW'), updatedAt: fn('NOW') }));
  return Cell.bulkCreate(cellsToCreate, options).catch(error => {
    logger.error('Error creating multiple cells, reason:', error);
    databaseError(error.message);
  });
};
