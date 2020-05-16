const { healthCheck } = require('./controllers/health_checks');
const { signup } = require('./controllers/users');
const { createUserSchema } = require('./schemas/users');
const { validateSchemaAndFail } = require('./middlewares/schemas_validator');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', validateSchemaAndFail(createUserSchema), signup);
};
