'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('cells', 'x', {
        type: Sequelize.BIGINT,
        allowNull: false
      }),
      queryInterface.addColumn('cells', 'y', {
        type: Sequelize.BIGINT,
        allowNull: false
      })
    ]),
  down: queryInterface =>
    Promise.all([queryInterface.removeColumn('cells', 'x'), queryInterface.removeColumn('cells', 'y')])
};
