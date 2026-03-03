const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        secure: false,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    })
    const mailOptions = {
        from: 'Task Manager <noreply@taskmanager.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailOptions)
}
module.exports = sendEmail