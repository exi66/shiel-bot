const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.Link)
      this.hasMany(models.Item)
    }
  }
  User.init(
    {
      discordId: DataTypes.STRING,
      notifyCoupons: DataTypes.BOOLEAN,
      notifyQueue: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true
    }
  )
  return User
}
