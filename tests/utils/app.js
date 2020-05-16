const request = require('supertest');

const { sequelize } = require('../../app/models');
const app = require('../../app');

const tables = Object.values(sequelize.models);

const truncateTable = (model, transaction) =>
  model.destroy({ truncate: true, cascade: true, force: true, restartIdentity: true, transaction });

exports.truncateDatabase = () =>
  sequelize.transaction(transaction => Promise.all(tables.map(table => truncateTable(table, transaction))));

exports.getResponse = ({ endpoint, headers = {}, query = {}, body = {}, method = 'put' }) =>
  request(app)
        [method](`${endpoint}`) // eslint-disable-line
    .set(headers)
    .query(query)
    .send(body);
