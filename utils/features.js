import DataUriParser from 'datauri/parser.js'
import path from 'path';
import nodemailer, { createTransport } from 'nodemailer'

export const getDataUri = (file) => {

    const parser = new DataUriParser();

    const extName = path.extname(file.originalname).toString()
    return parser.format(extName, file.buffer)
}

export const sendToken = (user, res, message, statusCode) => {

    const token = user.generateToken()

    return res
        .status(statusCode)
        .cookie("token", token, {
            ...cookiesOptions,
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }).json({
            success: true,
            message: message
        })
}

export const cookiesOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : false,
}

export const sendEmail = async (subject, to, text) => {
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        to,
        subject,
        text
    })
}