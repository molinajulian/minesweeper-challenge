'use strict';
const {
  GAMES_STATES: { STARTED }
} = require('../../app/constants');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('games', 'state', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: STARTED
    }),
  down: queryInterface => queryInterface.removeColumn('games', 'state')
};
