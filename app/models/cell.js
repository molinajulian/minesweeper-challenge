module.exports = (sequelize, DataTypes) => {
  const Cell = sequelize.define(
    'Cell',
    {
      visible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      isMine: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      minesNear: { type: DataTypes.INTEGER, allowNull: false },
      value: { type: DataTypes.STRING, allowNull: false },
      x: { type: DataTypes.INTEGER, allowNull: false },
      y: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: DataTypes.DATE
    },
    { timestamps: true, underscored: true, paranoid: true, tableName: 'cells' }
  );
  Cell.associate = ({ Game }) => {
    Cell.hasOne(Game, { as: 'game', foreignKey: 'gameId' });
  };
  return Cell;
};
