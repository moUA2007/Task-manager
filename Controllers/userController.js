const User = require('../Models/userModel')
const ErrorCustomize = require('../API/Error')
const catchAsync = require('../API/catchAsync')
const APIutils = require('../API/APIutils')
const bcrypt = require('bcrypt');


exports.getUsers = catchAsync(async(req,res,next)=>{
    const users = await User.find()
    res.status(200).json({
        status:'success',
        users
    })
})

exports.getUserByID = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorCustomize('No user found with this ID',400))
    }
    res.status(200).json({
        status:'success',
        user
    })
})

exports.updatePassword = catchAsync(async(req,res,next)=>{    //body  =>>>> curr        pass    confirm 
    const user = await User.findById(req.user._id).select('+password')
    if(!user){
        return next(new ErrorCustomize('User not found',401))
    }
    
    if(!await bcrypt.compare(req.body.currentPassword,user.password)){
        return next(new ErrorCustomize('Incorrect current password',401))
    }
    user.password = req.body.newPassword
    user.confirmedPassword = req.body.passwordConfirm 
    await user.save()
    res.status(200).json({
        status:'success',
        user
    })
})


