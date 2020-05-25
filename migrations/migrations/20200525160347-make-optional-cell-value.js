'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('cells', 'value', {
      type: Sequelize.STRING,
      allowNull: true
    }),
  // rollback it's no possible
  down: () => Promise.resolve()
};
