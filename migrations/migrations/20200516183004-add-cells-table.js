'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('cells', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      game_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'games',
          key: 'id'
        },
        allowNull: false
      },
      visible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_mine: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      mines_near: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      value: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: Sequelize.DATE
    }),
  down: queryInterface => queryInterface.dropTable('cells')
};
