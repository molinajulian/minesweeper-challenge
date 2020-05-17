module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    'Game',
    {
      height: { type: DataTypes.BIGINT, allowNull: false },
      width: { type: DataTypes.BIGINT, allowNull: false },
      minesAmount: { type: DataTypes.BIGINT, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: DataTypes.DATE
    },
    { timestamps: true, underscored: true, paranoid: true, tableName: 'games' }
  );
  Game.associate = ({ User, Cell }) => {
    Game.belongsTo(User, { as: 'user', foreignKey: 'userId' });
    Game.hasMany(Cell, { as: 'cells', foreignKey: 'gameId' });
  };
  return Game;
};
