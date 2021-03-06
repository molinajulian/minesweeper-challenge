const ENVIRONMENT = process.env.NODE_ENV || 'development';

// eslint-disable-next-line global-require
if (ENVIRONMENT !== 'production') require('dotenv').config();

const configFile = `./${ENVIRONMENT}`;

const isObject = variable => variable instanceof Object;

/*
 * Deep immutable copy of source object into tarjet object and returns a new object.
 */
const deepMerge = (target, source) => {
  if (isObject(target) && isObject(source)) {
    return Object.keys(source).reduce(
      (output, key) => ({
        ...output,
        [key]: isObject(source[key]) && key in target ? deepMerge(target[key], source[key]) : source[key]
      }),
      { ...target }
    );
  }
  return target;
};

const config = {
  common: {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    api: {
      bodySizeLimit: process.env.API_BODY_SIZE_LIMIT || 1024 * 1024 * 10,
      parameterLimit: process.env.API_PARAMETER_LIMIT || 10000,
      port: process.env.PORT
    },
    session: {
      headerName: process.env.SESSION_HEADER_NAME || 'authorization',
      expirationValue: process.env.SESSION_EXPIRATION_VALUE || 3600,
      secretKey: process.env.SESSION_SECRET_KEY
    },
    server: {
      hashingSalts: process.env.HASHING_SALTS || 10
    }
  }
};

const customConfig = require(configFile).config;
module.exports = deepMerge(config, customConfig);
