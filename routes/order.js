import express from "express";
import { createOrder, getAminOrders, getMyOrders, getOrderDetails, processOrder, processPayment } from "../controllers/order.js";
import { isAdmin, isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder)

router.post("/payment", isAuthenticated, processPayment)

router.get("/my", isAuthenticated, getMyOrders)
router.get("/admin", isAuthenticated, isAdmin, getAminOrders)

router.route("/single/:id").get(isAuthenticated, getOrderDetails).put(isAuthenticated, isAdmin, processOrder)

export default router;