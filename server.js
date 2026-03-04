const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const app = require('./app')
const mongoose = require('mongoose')
const port = process.env.PORT || 5001

// Mongoose connection options
const mongooseOptions = {
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
}

mongoose.connect(process.env.CONNECT, mongooseOptions)
    .then(() => {
        console.log('DB connected successfully')
        // Start server only after DB connection
        app.listen(port,()=>{
            console.log(`app is running on port ${port}`)
        })
    })
    .catch(err => {
        console.error('DB connection error:', err.message)
        // Retry connection after 5 seconds
        setTimeout(() => {
            console.log('Retrying MongoDB connection...')
            mongoose.connect(process.env.CONNECT, mongooseOptions)
        }, 5000)
    })
