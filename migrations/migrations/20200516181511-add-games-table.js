'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('games', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      height: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      width: {
        type: Sequelize.BIGINT,
        allowNull: false
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
  down: queryInterface => queryInterface.dropTable('games')
};
