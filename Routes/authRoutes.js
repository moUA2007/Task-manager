const authController = require('../Controllers/authController')
const express = require('express')
const router = express.Router()

router.route('/signUp').post(authController.signUp)
router.route('/login').post(authController.login)
router.route('/logout').post(authController.logout)
router.route('/me').get(authController.protect, authController.getMe)
router.route('/forget-pass').post(authController.forgetPass)
router.route('/reset-password/:token').patch(authController.resetPassword)

module.exports = router