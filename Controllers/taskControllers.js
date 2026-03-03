const ErrorCustomize = require('../API/Error')
const Task = require('../Models/taskModel')
const catchAsync = require('../API/catchAsync')
const APIutils = require('../API/APIutils')


exports.getTasks = catchAsync(async (req, res, next) => {
    // Only get tasks belonging to the logged-in user
    const baseQuery = Task.find({ user: req.user._id });
    const util = new APIutils(baseQuery, req.query)
        .filter()
        .sort()
        .limitFields()
    await util.pagination()
    const tasks = await util.query

    res.status(200).json({
        status: 'success',
        tasks: tasks
    })
})

exports.getTaskByID = catchAsync(async (req, res, next) => {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
    if (!task) {
        return next(new ErrorCustomize('No task found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        task: task
    })
})

exports.createTask = catchAsync(async (req, res, next) => {
    // Assign the task to the logged-in user
    req.body.user = req.user._id;
    const task = await Task.create(req.body)
    res.status(201).json({
        status: 'success',
        task: task
    })
})

exports.updateTask = catchAsync(async (req, res, next) => {
    // Only allow updating own tasks
    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    )
    if (!task) {
        return next(new ErrorCustomize('No task found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        task: task
    })
})

exports.deleteTask = catchAsync(async (req, res, next) => {
    // Only allow deleting own tasks
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!task) {
        return next(new ErrorCustomize('No task found with that ID', 404))
    }
    res.status(204).json({
        status: 'success',
        task: null
    })
})
