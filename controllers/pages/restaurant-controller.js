const { Restaurant, Category, Comment, User, Favorite } = require('../../models')
const sequelize = require('sequelize')
const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User }, // 尚未解決排序
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      order: [[{ model: Comment, include: User }, 'createdAt', 'DESC']],
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        return restaurant.increment('view_counts')
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
        res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, { // 去資料庫用 id 找一筆資料
      // raw: true, // 找到以後整理格式再回傳
      include: [
        Category,
        Comment,
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        const result = {
          ...restaurant.toJSON(),
          // favoritedCount: restaurant.FavoritedUsers.length, //test no
          // commentCount: restaurant.Comments.length  //test no
        }
        res.render('dashboard', { restaurant: result })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    // 失敗的資料庫查詢
    // return Restaurant.getTopFavoritedCount(10, User)
    // return Restaurant.findAll({
    //   include: [{ model: Favorite }],  
    //   group: ['Restaurant.id'],
    //   attributes: {
    //     include: [
    //       [sequelize.fn('COUNT', sequelize.col('favorites.id')), 'favoritedCount']
    //     ]
    //   },
    //   order: [[sequelize.fn('COUNT', sequelize.col('favorites.id')), 'DESC']],
    //   limit: 10
    // })

    //   .then(restaurants => {
    //     const result = restaurants
    //       .map(restaurant => ({
    //         ...restaurant.toJSON(),
    //         description: restaurant.description.substring(0, 50),
    //         favoritedCount: restaurant.Favorites.length,
    //         isFavorited: req.user.FavoritedRestaurants.some(f => f.id === restaurant.id),
    //         isLiked: req.user.LikedRestaurants.some(l => l.id === restaurant.id) // R05test no
    //       }))
    //     res.render('top-restaurants', { restaurants: result })
    //   })

    return Restaurant.findAll({
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        const topCount = 10 // 取 top 10
        const result = restaurants
          .map(restaurant => ({
            ...restaurant.toJSON(),
            description: restaurant.description ? restaurant.description.substring(0, 50) : '沒有描述',
            favoritedCount: restaurant.FavoritedUsers.length,
            isFavorited: req.user.FavoritedRestaurants.some(f => f.id === restaurant.id),
            // isLiked: req.user.LikedRestaurants.some(l => l.id === restaurant.id) // R05test no
          }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .map((restaurant, i) => ({
            ...restaurant,
            favoritedRank: i + 1,
          }))
        res.render('top-restaurants', { restaurants: result.slice(0, (topCount)) })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
