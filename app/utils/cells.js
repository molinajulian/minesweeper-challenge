exports.getRandomPositions = (xMax, yMax, array) => {
  const proposedPosition = { x: Math.ceil(Math.random() * xMax) - 1, y: Math.ceil(Math.random() * yMax) - 1 };
  if (array.some(position => exports.isSamePosition(position, proposedPosition))) {
    return exports.getRandomPositions(xMax, yMax, array);
  }
  return proposedPosition;
};

exports.getMines = (amount, height, width) => {
  const arrayOfMines = [];
  Array.from(Array(amount).keys()).forEach(() => {
    arrayOfMines.push(exports.getRandomPositions(width, height, arrayOfMines));
  });
  return arrayOfMines;
};

exports.getMinesNear = ({ xPosition, yPosition, mines, height, width }) => {
  const validPositionsAround = exports.getNearPositionsByCoordinates({
    x: xPosition,
    y: yPosition,
    maxY: height,
    maxX: width
  });
  const amountMinesNear = validPositionsAround.filter(positionNear =>
    mines.some(minePosition => exports.isSamePosition(positionNear, minePosition))
  );
  return (amountMinesNear && amountMinesNear.length) || 0;
};

exports.getNearPositionsByCoordinates = ({ x: xPosition, y: yPosition, maxX, maxY }) => {
  const nearPositions = [
    { x: xPosition - 1, y: yPosition + 1 },
    { x: xPosition - 1, y: yPosition },
    { x: xPosition - 1, y: yPosition - 1 },
    { x: xPosition, y: yPosition - 1 },
    { x: xPosition, y: yPosition + 1 },
    { x: xPosition + 1, y: yPosition + 1 },
    { x: xPosition + 1, y: yPosition },
    { x: xPosition + 1, y: yPosition - 1 }
  ];
  const validPositionsAround = nearPositions.filter(({ x, y }) => x >= 0 && y >= 0 && x < maxX && y < maxY);
  return validPositionsAround;
};

exports.isSamePosition = (firstPosition, secondPosition) =>
  firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y;

exports.checkMinesExistence = positions => positions.some(({ isMine }) => isMine);

exports.getCellByPosition = ({ cells, x, y }) =>
  cells.find(({ dataValues }) => exports.isSamePosition(dataValues, { x, y }));

const discoverNearCells = ({ positions, cells, selectedCell, height, width, acumulator }) => {
  const cellIdsToUpdate = [...acumulator, ...(positions ? positions.map(({ id }) => id) : [])];
  let existMinesNear = false;
  let futureCellsToCheck = [];
  positions.forEach(position => {
    const nearPositions = exports.getNearPositionsByCoordinates({
      x: position.x,
      y: position.y,
      maxX: height,
      maxY: width
    });
    if (nearPositions && nearPositions.length) {
      const modelsOfNearPositions = cells.filter(({ dataValues }) =>
        nearPositions.some(mineNear => exports.isSamePosition(mineNear, { x: dataValues.x, y: dataValues.y }))
      );
      const minesToCheck = modelsOfNearPositions.filter(
        nearPosition =>
          !exports.isSamePosition(selectedCell, nearPosition) &&
          !positions.some(positionToCheck => exports.isSamePosition(positionToCheck, nearPosition))
      );
      if (exports.checkMinesExistence(minesToCheck)) existMinesNear = true;
      futureCellsToCheck = [...futureCellsToCheck, ...minesToCheck];
    }
  });
  if (existMinesNear) return cellIdsToUpdate;
  return discoverNearCells({
    positions: futureCellsToCheck,
    cells,
    height,
    width,
    selectedCell,
    acumulator: cellIdsToUpdate
  });
};

exports.discoverCell = ({ x, y, game: { cells, dataValues: gameDataValues } }) => {
  const cellUserValues = cells.map(({ dataValues }) => ({
    x: dataValues.x + 1,
    y: dataValues.y + 1,
    value: dataValues.flag || dataValues.minesNear,
    visible: dataValues.visible
  }));
  const selectedCell = cells.find(({ dataValues }) => exports.isSamePosition({ x, y }, dataValues));
  if (selectedCell.isMine) return Promise.resolve({ values: cellUserValues, lost: true, selectedCell });
  const minesNear = exports.getNearPositionsByCoordinates({
    x,
    y,
    maxX: gameDataValues.width,
    maxY: gameDataValues.height
  });
  const cellsToCheckMines = cells.filter(({ dataValues }) =>
    minesNear.some(mineNear => exports.isSamePosition(mineNear, { x: dataValues.x, y: dataValues.y }))
  );
  if (exports.checkMinesExistence(cellsToCheckMines)) {
    return Promise.resolve({
      lost: false,
      selectedCell,
      values: cellUserValues.map(cell => ({
        x: cell.x,
        y: cell.y,
        value: cell.visible || exports.isSamePosition({ x: x + 1, y: y + 1 }, cell) ? cell.value : null
      }))
    });
  }
  const cellIdsToUpdate = discoverNearCells({
    positions: cellsToCheckMines,
    cells,
    selectedCell,
    width: gameDataValues.width,
    height: gameDataValues.height,
    acumulator: [selectedCell.id]
  });
  const actualCellUserValues = cells.map(cell => ({
    x: cell.x + 1,
    y: cell.y + 1,
    value: cellIdsToUpdate.includes(cell.dataValues.id)
      ? cell.dataValues.flag || cell.dataValues.minesNear
      : cell.dataValues.flag || cell.dataValues.value
  }));
  return Promise.resolve({
    lost: false,
    cellIdsToUpdate,
    selectedCell,
    values: actualCellUserValues
  });
};
