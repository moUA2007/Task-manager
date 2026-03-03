const ErrorCustomize = require('../API/Error')
const catchAsync = require('../API/catchAsync')
const User = require('../Models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const util = require('util');
const sendEmail = require('../API/email')
const crypto = require('crypto')

const signToken = id => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    return token
}
exports.signToken = signToken;

// Send token as HTTP-only cookie
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
        ),
        httpOnly: true,   // Cannot be accessed by JavaScript
        sameSite: 'strict' // CSRF protection
    };

    // In production, only send cookie over HTTPS
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    // Only allow specific fields (prevent role injection!)
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmedPassword: req.body.confirmedPassword
    });
    createSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new ErrorCustomize('please enter password or email', 400))
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new ErrorCustomize('Incorrect email or password', 401))
    }
    createSendToken(user, 200, res);
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1) Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2) Check cookies
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token || token === 'loggedout') {
        return next(new ErrorCustomize('You are not logged in! Please log in to get access.', 401))
    }

    const check = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(check.id);

    if (!user) {
        return next(new ErrorCustomize('The user belonging to this token no longer exists.', 401))
    }
    if (user.changedPasswordAfter(check.iat)) {
        return next(new ErrorCustomize('User recently changed password! Please login again.', 401));
    }
    req.user = user;
    next();
})

// Check if user is logged in (for frontend)
exports.getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        }
    });
});

// Role-based access control
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorCustomize('You do not have permission to perform this action', 403));
        }
        next();
    };
};

exports.forgetPass = catchAsync(async (req, res, next) => {
    const { email } = req.body
    if (!email) {
        return next(new ErrorCustomize('please enter email', 400))
    }
    const user = await User.findOne({ email })
    if (!user) {
        return next(new ErrorCustomize('there is not any user by this email', 401))
    }
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })
    const message = `Forgot your password? Use this reset token to set a new password:\n\n${resetToken}\n\nThis token is valid for 10 minutes.\nIf you didn't forget your password, please ignore this email!`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        })
    }
    catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })
        return next(new ErrorCustomize('there is an error in sending email', 500))
    }
    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
    })
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params
    const { password, passwordConfirm } = req.body
    if (!password || !passwordConfirm) {
        return next(new ErrorCustomize('please enter password and passwordConfirm', 400))
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })
    if (!user) {
        return next(new ErrorCustomize('Token is invalid or has expired', 401))
    }
    user.password = password
    user.confirmedPassword = passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangedAt = Date.now() - 1000;
    await user.save()
    createSendToken(user, 200, res);
})