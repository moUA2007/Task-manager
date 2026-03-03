const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const app = require('./app')
const mongoose = require('mongoose')
const port = process.env.PORT || 5001

mongoose.connect(process.env.CONNECT)
    .then(() => console.log('DB connected successfully'))
    .catch(err => console.log('DB connection error:', err));

app.listen(port,()=>{
    console.log(`app is running on port ${port}`)
})
