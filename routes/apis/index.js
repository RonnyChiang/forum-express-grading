const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')

const restController = require('../../controllers/apis/restaurant-controller')
router.get('/restaurants', restController.getRestaurants)
router.use('/admin', admin)
module.exports = router