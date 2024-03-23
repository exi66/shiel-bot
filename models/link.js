const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Link extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User)
    }
  }
  Link.init(
    {
      userId: DataTypes.INTEGER,
      expiredAt: DataTypes.DATE,
      link: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Link',
      tableName: 'links',
      timestamps: true
    }
  )
  return Link
}
