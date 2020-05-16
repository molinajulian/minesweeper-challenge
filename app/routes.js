const { healthCheck } = require('./controllers/health_checks');
const { signup } = require('./controllers/users');

exports.init = app => {
  app.get('/health', healthCheck);
  app.post('/users', signup);
};
