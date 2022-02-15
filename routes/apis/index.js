const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../../middleware/error-handler')
const passport = require('../../config/passport')

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.get('/restaurants', restController.getRestaurants)
router.use('/admin', admin)
router.use('/', apiErrorHandler)
module.exports = router