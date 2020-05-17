const { createGameMapper } = require('../mappers/games');
const { createGame } = require('../interactors/games');

exports.createGame = (req, res, next) => {
  const mappedData = createGameMapper(req);
  return createGame(mappedData)
    .then(({ id }) => res.status(201).send({ id }))
    .catch(next);
};
