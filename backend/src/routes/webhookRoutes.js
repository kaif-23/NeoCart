import express from 'express'
import { razorpayWebhook } from '../controllers/webhookController.js'

const webhookRoutes = express.Router()

// Razorpay sends POST requests to this endpoint
webhookRoutes.post('/razorpay', razorpayWebhook)

export default webhookRoutes
