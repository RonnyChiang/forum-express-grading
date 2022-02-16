const { User, Comment, Restaurant, Favorite, Like, Followship } = require('../models')
const bcrypt = require('bcryptjs')
const { getUser } = require('../helpers/auth-helpers')
const userServices = {
  signUp: (req, cb) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // 前面加 return
      })
      .then(hash => User.create({ // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then((createdUser) => {
        createdUser = createdUser.toJSON()
        delete createdUser.password
        return cb(null, { user: createdUser })
      })
      .catch(err => cb(err))
  },
  getUser: (req, cb) => {
    const requestUserId = req.params.id
    const selfUser = getUser(req)
    return User.findByPk(requestUserId, {
      include: [
        { model: Comment, include: Restaurant },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followees' }
      ]
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        const set = new Set()
        const commentNoDuplicate = user.toJSON().Comments.filter(item => !set.has(item.restaurantId) ? set.add(item.restaurantId) : false)
        const result = {
          ...user.toJSON(),
          Comments: commentNoDuplicate,
          commentRestaurantsCount: commentNoDuplicate?.length || 0,
          commentCount: user.Comments?.length || 0,
          followerCount: user.Followers?.length || 0,
          followeeCount: user.Followees?.length || 0,
          isFollowed: req.user.Followees.some(f => f.id === user.id),
          isFollowedMe: req.user.Followers.some(f => f.id === user.id),
        }
        delete result.password
        return cb(null, { user: result, selfUser })
      })
      .catch(err => cb(err))
  },
}

module.exports = userServices
