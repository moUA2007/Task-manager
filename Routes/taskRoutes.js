const express = require('express')
const taskController = require('../Controllers/taskControllers')
const authController = require('../Controllers/authController')
const router = express.Router()

// All task routes require authentication
router.use(authController.protect);

router.route('/')
    .get(taskController.getTasks)
    .post(taskController.createTask)

router.route('/:id')
    .get(taskController.getTaskByID)
    .delete(taskController.deleteTask)
    .patch(taskController.updateTask)

module.exports = router
