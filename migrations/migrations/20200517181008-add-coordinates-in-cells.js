'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('cells', 'x', {
        type: Sequelize.INTEGER,
        allowNull: false
      }),
      queryInterface.addColumn('cells', 'y', {
        type: Sequelize.INTEGER,
        allowNull: false
      })
    ]),
  down: queryInterface =>
    Promise.all([queryInterface.removeColumn('cells', 'x'), queryInterface.removeColumn('cells', 'y')])
};
