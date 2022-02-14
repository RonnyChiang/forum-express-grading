const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const { apiErrorHandler } = require('../../middleware/error-handler')

const restController = require('../../controllers/apis/restaurant-controller')
router.get('/restaurants', restController.getRestaurants)
router.use('/admin', admin)
router.use('/', apiErrorHandler)
module.exports = router