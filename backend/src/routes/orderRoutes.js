import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { allOrders, getOrderDetail, placeOrder, placeOrderRazorpay, updateStatus, userOrders, verifyRazorpay } from '../controllers/orderController.js'
import adminAuth from '../middlewares/adminAuth.js'

const orderRoutes = express.Router()

//for User
orderRoutes.post("/placeorder", isAuth, placeOrder)
orderRoutes.post("/razorpay", isAuth, placeOrderRazorpay)
orderRoutes.post("/userorder", isAuth, userOrders)
orderRoutes.post("/verifyrazorpay", isAuth, verifyRazorpay)

//for Admin
orderRoutes.post("/list", adminAuth, allOrders)
orderRoutes.post("/detail", adminAuth, getOrderDetail)
orderRoutes.post("/status", adminAuth, updateStatus)

export default orderRoutes
