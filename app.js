import express from "express";
import { config } from 'dotenv'
import { errorMiddleware } from "./middleware/error.js";
import cookieParser from "cookie-parser";
import cors from 'cors'

config({
    path: './data/config.env'
})
export const app = express();

//using middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    methods: ['GET','POST','PUT','DELETE'],
    origin: [process.env.FRONTEND_URI_1,process.env.FRONTEND_URI_2]
}))

app.get("/", (req, res, next) => {
    res.send('working')
})

// importing routers here
import userRoute from './routes/user.js';
import productRoute from './routes/product.js'
import orderRoute from './routes/order.js'

app.use("/api/v1/user", userRoute)
app.use("/api/v1/product", productRoute)
app.use("/api/v1/order", orderRoute)

//using error middleware
app.use(errorMiddleware)