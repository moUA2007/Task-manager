const express = require('express')
const userController = require('../Controllers/userController')
const authController = require('../Controllers/authController')
const router = express.Router() 

router.use(authController.protect);

router.route('/')
    .get(userController.getUsers);

router.route('/updatePassword')
    .post(userController.updatePassword);

router.route('/:id')
    .get(userController.getUserByID);

module.exports = router;