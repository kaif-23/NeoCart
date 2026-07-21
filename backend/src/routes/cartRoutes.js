import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { addToCart, getUserCart, UpdateCart, getCartTotals } from '../controllers/cartController.js'

const cartRoutes = express.Router()

cartRoutes.post('/get', isAuth, getUserCart)
cartRoutes.post('/add', isAuth, addToCart)
cartRoutes.post('/update', isAuth, UpdateCart)
// /totals is a POST route without isAuth so guests can send their cartData
cartRoutes.post('/totals', getCartTotals)

export default cartRoutes
