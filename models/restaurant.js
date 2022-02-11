'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Restaurant.belongsTo(models.Category, { foreignKey: 'categoryId' })
      Restaurant.hasMany(models.Comment, { foreignKey: 'restaurantId' })
      Restaurant.belongsToMany(models.User, {
        through: models.Favorite,
        foreignKey: 'restaurantId',
        as: 'FavoritedUsers'
      })
      Restaurant.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'restaurantId',
        as: 'LikedUsers'
      })
    }
    static getCountByCategory = (async () => {
      return await Restaurant.findAll({
        group: ['categoryId'],
        attributes: ['categoryId', [sequelize.fn('COUNT', 'categoryId'), 'amount']],
        raw: true
      })
    })
    static getTopFavoritedCount = (async (limit) => {
      return await Restaurant.findAll({
        include: [{ model: User, as: FavoritedUsers, duplicating: false }],  // User & FavoriteUsers is not difined
        group: ['id'],
        attributes: ['FavoriteUsers', [sequelize.fn('COUNT', 'restaurantId'), 'favoritedCount']],
        order: [['favoritedCount', 'DESC']],
        limit: [limit]
      })
    })
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    openingHours: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    viewCounts: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Restaurant',
    underscored: true
  })
  return Restaurant
}
