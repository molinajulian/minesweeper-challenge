const { createGameMapper, playGameMapper } = require('../mappers/games');
const { createGame, playGame } = require('../interactors/games');
const { playGameSerializer } = require('../serializers/games');

exports.createGame = (req, res, next) => {
  const mappedData = createGameMapper(req);
  return createGame(mappedData)
    .then(({ id }) => res.status(201).send({ id }))
    .catch(next);
};
exports.playGame = (req, res, next) => {
  const mappedData = playGameMapper(req);
  return playGame(mappedData)
    .then(board => res.status(200).send(playGameSerializer(board)))
    .catch(next);
};
