module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    'Game',
    {
      height: { type: DataTypes.BIGINT, allowNull: false },
      width: { type: DataTypes.BIGINT, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: DataTypes.DATE
    },
    { timestamps: true, underscored: true, paranoid: true, tableName: 'games' }
  );
  Game.associate = ({ User }) => {
    Game.hasOne(User, { as: 'user', foreignKey: 'userId' });
  };
  return Game;
};
