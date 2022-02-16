const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin, authenticatedSelf } = require('../../middleware/api-auth')
const passport = require('../../config/passport')
const upload = require('../../middleware/multer')

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

router.use('/admin', authenticated, authenticatedAdmin, admin)
router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.get('/restaurants', authenticated, restController.getRestaurants)
router.put('/users/:id', authenticated, upload.single('image'), authenticatedSelf, userController.putUser)
router.get('/users/:id', authenticated, userController.getUser)
router.use('/', apiErrorHandler)
module.exports = router