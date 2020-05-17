const { healthCheck } = require('./controllers/health_checks');
const { signUp, signIn } = require('./controllers/users');
const { singUpSchema, signInSchema } = require('./schemas/users');
const { validateSchemaAndFail } = require('./middlewares/schemas_validator');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', validateSchemaAndFail(singUpSchema), signUp);
  app.post('/users/login', validateSchemaAndFail(signInSchema), signIn);
};
