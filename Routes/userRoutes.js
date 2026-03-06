const express = require('express')
const userController = require('../Controllers/userController')
const authController = require('../Controllers/authController')
const router = express.Router() 

router.use(authController.protect);

router.route('/')
    .get(authController.restrictTo('admin'), userController.getUsers);

router.route('/updatePassword')
    .post(userController.updatePassword);

router.route('/:id')
    .get(authController.restrictTo('admin'), userController.getUserByID);

module.exports = router;