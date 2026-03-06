const express = require('express')
const path = require('path')
const app = express()
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cookieParser = require('cookie-parser')
const taskRoutes = require('./Routes/taskRoutes')
const authRoutes = require('./Routes/authRoutes')
const userRoutes = require('./Routes/userRoutes')
const ErrorCustomize = require('./API/Error')

// 1) Security HTTP Headers
app.use(helmet());

// 2) Rate Limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// 3) Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 4) Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 5) Data sanitization against XSS
app.use(xss());

// 6) Logging (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 7) Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// 8) Routes
app.use('/api/v2/task', taskRoutes)
app.use('/api/v2/auth', authRoutes)
app.use('/api/v2/user', userRoutes)

// 9) Handle undefined routes
app.all('*', (req, res, next) => {
    // Skip for static files / frontend routes
    if (!req.originalUrl.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    next(new ErrorCustomize(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 10) Global Error Handler
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    
    // Production: don't leak error details
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    
    // Handle specific MongoDB errors
    let message = 'Something went wrong';
    let statusCode = 500;

    if (err.name === 'CastError') {
        message = `Invalid ${err.path}: ${err.value}`;
        statusCode = 400;
    }
    if (err.code === 11000) {
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
        message = `Duplicate field value: ${value}. Please use another value!`;
        statusCode = 400;
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        message = `Invalid input data. ${errors.join('. ')}`;
        statusCode = 400;
    }
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token. Please log in again!';
        statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Your token has expired! Please log in again.';
        statusCode = 401;
    }

    console.error('ERROR:', err);
    return res.status(statusCode).json({
        status: 'error',
        message
    });
});

module.exports = app