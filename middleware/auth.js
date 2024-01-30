import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/error.js";
import { User } from "../models/user.js";

export const isAuthenticated = async (req, res, next) => {

    // const token = req.cookies.token;
    const { token } = req.cookies;

    if (!token) return next(new ErrorHandler("Not Logged In", 401))

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decodedData._id)

    next()
}

export const isAdmin = async (req, res, next) => {

    if (req.user.role!== 'admin') return next(new ErrorHandler("Only Admin Allowed", 401))

    next()
}