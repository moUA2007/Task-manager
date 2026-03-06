const authController = require('../Controllers/authController')
const express = require('express')
const rateLimit = require('express-rate-limit')
const router = express.Router()

// Stricter rate limiting for password reset (3 requests per hour per IP)
const forgetPassLimiter = rateLimit({
    max: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Too many password reset requests, please try again in an hour!'
});

router.route('/signUp').post(authController.signUp)
router.route('/login').post(authController.login)
router.route('/logout').post(authController.logout)
router.route('/me').get(authController.protect, authController.getMe)
router.route('/forget-pass').post(forgetPassLimiter, authController.forgetPass)
router.route('/reset-password/:token').patch(authController.resetPassword)

module.exports = router