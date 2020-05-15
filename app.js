const { expressMiddleware, expressRequestIdMiddleware } = require('express-wolox-logger');
const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const config = require('./config');
const routes = require('./app/routes');
const errors = require('./app/middlewares/errors');
const logger = require('./app/logger');

const bodyParserJsonConfig = () => ({
  parameterLimit: config.common.api.parameterLimit,
  limit: config.common.api.bodySizeLimit
});

const bodyParserUrlencodedConfig = () => ({
  extended: true,
  parameterLimit: config.common.api.parameterLimit,
  limit: config.common.api.bodySizeLimit
});

const app = express();

app.use(cors());

// Client must send "Content-Type: application/json" header
app.use(bodyParser.json(bodyParserJsonConfig()));
app.use(bodyParser.urlencoded(bodyParserUrlencodedConfig()));
app.use(expressRequestIdMiddleware());

if (!config.isTesting) app.use(expressMiddleware({ loggerFn: logger.info }));

routes.init(app);

app.use(errors.handle);

module.exports = app;
