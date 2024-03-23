'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User)
    }
  }
  Item.init(
    {
      userId: DataTypes.INTEGER,
      itemId: DataTypes.INTEGER,
      lvl: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Item',
      tableName: 'items'
    }
  )
  return Item
}
