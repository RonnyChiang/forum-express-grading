const { Restaurant, Category, Comment, User, Favorite } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const sequelize = require('sequelize')
const restaurantServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 8
    let categoryId = req.query.categoryId || ''
    const where = {}
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    if (categoryId === 'null') {
      where.categoryId = null
      categoryId = 'null'
    } else if (categoryId) {
      where.categoryId = Number(categoryId)
      categoryId = Number(categoryId)
    }
    return Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: where,
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        return cb(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
  },
  // getRestaurant: (req, res, next) => {
  //   return Restaurant.findByPk(req.params.id, {
  //     include: [
  //       Category,
  //       { model: Comment, include: User }, // 尚未解決排序
  //       { model: User, as: 'FavoritedUsers' },
  //       { model: User, as: 'LikedUsers' }
  //     ],
  //     order: [[{ model: Comment, include: User }, 'createdAt', 'DESC']],
  //     nest: true
  //   })
  //     .then(restaurant => {
  //       if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
  //       return restaurant.increment('view_counts')
  //     })
  //     .then(restaurant => {
  //       const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
  //       const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)
  //       res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
  //     })
  //     .catch(err => next(err))
  // },
  // getDashboard: (req, res, next) => {
  //   return Restaurant.findByPk(req.params.id, { // 去資料庫用 id 找一筆資料
  //     // raw: true, // 找到以後整理格式再回傳
  //     include: [
  //       Category,
  //       Comment,
  //       { model: User, as: 'FavoritedUsers' }
  //     ]
  //   })
  //     .then(restaurant => {
  //       if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
  //       const result = {
  //         ...restaurant.toJSON(),
  //         // favoritedCount: restaurant.FavoritedUsers.length, //test no
  //         // commentCount: restaurant.Comments.length  //test no
  //       }
  //       res.render('dashboard', { restaurant: result })
  //     })
  //     .catch(err => next(err))
  // },
  // getFeeds: (req, res, next) => {
  //   return Promise.all([
  //     Restaurant.findAll({
  //       limit: 10,
  //       order: [['createdAt', 'DESC']],
  //       include: [Category],
  //       raw: true,
  //       nest: true
  //     }),
  //     Comment.findAll({
  //       limit: 10,
  //       order: [['createdAt', 'DESC']],
  //       include: [User, Restaurant],
  //       raw: true,
  //       nest: true
  //     })
  //   ])
  //     .then(([restaurants, comments]) => {
  //       res.render('feeds', {
  //         restaurants,
  //         comments
  //       })
  //     })
  //     .catch(err => next(err))
  // },
  // getTopRestaurants: (req, res, next) => {
  //   // 失敗的資料庫查詢
  //   // return Restaurant.getTopFavoritedCount(10, User)
  //   // return Restaurant.findAll({
  //   //   include: [{ model: Favorite }],  
  //   //   group: ['Restaurant.id'],
  //   //   attributes: {
  //   //     include: [
  //   //       [sequelize.fn('COUNT', sequelize.col('favorites.id')), 'favoritedCount']
  //   //     ]
  //   //   },
  //   //   order: [[sequelize.fn('COUNT', sequelize.col('favorites.id')), 'DESC']],
  //   //   limit: 10
  //   // })

  //   //   .then(restaurants => {
  //   //     const result = restaurants
  //   //       .map(restaurant => ({
  //   //         ...restaurant.toJSON(),
  //   //         description: restaurant.description.substring(0, 50),
  //   //         favoritedCount: restaurant.Favorites.length,
  //   //         isFavorited: req.user.FavoritedRestaurants.some(f => f.id === restaurant.id),
  //   //         isLiked: req.user.LikedRestaurants.some(l => l.id === restaurant.id) // R05test no
  //   //       }))
  //   //     res.render('top-restaurants', { restaurants: result })
  //   //   })

  //   return Restaurant.findAll({
  //     include: [
  //       Category,
  //       { model: User, as: 'FavoritedUsers' }]
  //   })
  //     .then(restaurants => {
  //       const topCount = 10 // 取 top 10
  //       const result = restaurants
  //         .map(restaurant => ({
  //           ...restaurant.toJSON(),
  //           description: restaurant.description.substring(0, 50),
  //           favoritedCount: restaurant.FavoritedUsers.length,
  //           isFavorited: req.user.FavoritedRestaurants.some(f => f.id === restaurant.id),
  //           // isLiked: req.user.LikedRestaurants.some(l => l.id === restaurant.id) // R05test no
  //         }))
  //         .sort((a, b) => b.favoritedCount - a.favoritedCount)
  //         .map((restaurant, i) => ({
  //           ...restaurant,
  //           favoritedRank: i + 1,
  //         }))
  //       console.log(result)
  //       res.render('top-restaurants', { restaurants: result.slice(0, (topCount)) })
  //     })
  //     .catch(err => next(err))
  // }
}
module.exports = restaurantServices
