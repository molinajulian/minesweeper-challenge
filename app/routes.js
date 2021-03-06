const { healthCheck } = require('./controllers/health_checks');
const { signUp, signIn } = require('./controllers/users');
const { createGame, playGame } = require('./controllers/games');
const { singUpSchema, signInSchema } = require('./schemas/users');
const { createGameSchema, playGameSchema } = require('./schemas/games');
const { validateSchemaAndFail } = require('./middlewares/schemas_validator');
const { checkToken } = require('./middlewares/authorizations');
const { checkGameInput } = require('./middlewares/games');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', validateSchemaAndFail(singUpSchema), signUp);
  app.post('/users/login', validateSchemaAndFail(signInSchema), signIn);
  app.post('/games', checkToken, validateSchemaAndFail(createGameSchema), checkGameInput, createGame);
  app.post('/games/:gameId/play', checkToken, validateSchemaAndFail(playGameSchema), playGame);
};
