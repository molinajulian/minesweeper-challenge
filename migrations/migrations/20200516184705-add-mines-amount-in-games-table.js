'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('games', 'mines_amount', {
      type: Sequelize.BIGINT,
      allowNull: false
    }),
  down: queryInterface => queryInterface.removeColumn('games', 'mines_amount')
};
