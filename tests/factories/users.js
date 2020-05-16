const { factory } = require('factory-girl');

const { factoryWithCustomizedValue } = require('./factory_by_models');

const modelName = 'User';

factoryWithCustomizedValue(modelName, { deletedAt: null });

module.exports = {
  createUser: user => factory.create(modelName, user),
  buildUser: user => factory.build(modelName, user),
  createManyUsers: ({ user, quantity }) => factory.createMany(modelName, quantity, user)
};
