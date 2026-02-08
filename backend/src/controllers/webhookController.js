import crypto from 'crypto'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'
import Product from '../models/productModel.js'

/**
 * Razorpay Webhook Handler
 * 
 * Razorpay sends webhook events to this endpoint when payment events occur.
 * This is more reliable than client-side verification because it works even if
 * the user closes their browser after paying.
 * 
 * Configure this URL in Razorpay Dashboard → Settings → Webhooks:
 *   https://your-domain.com/api/webhook/razorpay
 * 
 * Events to subscribe: payment.captured, payment.failed
 */

// Verify Razorpay webhook signature
const verifyWebhookSignature = (rawBody, signature, secret) => {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex')

    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
    )
}

// Decrement inventory atomically (shared logic with orderController)
const decrementInventory = async (items) => {
    for (const item of items) {
        const result = await Product.findOneAndUpdate(
            {
                _id: item.productId || item._id,
                [`inventory.${item.size}.stock`]: { $gte: item.quantity },
                [`inventory.${item.size}.available`]: true
            },
            {
                $inc: { [`inventory.${item.size}.stock`]: -item.quantity }
            },
            { new: true }
        )

        if (result) {
            const updatedStock = result.inventory.get(item.size)?.stock
            if (updatedStock !== undefined && updatedStock <= 0) {
                await Product.findByIdAndUpdate(item.productId || item._id, {
                    [`inventory.${item.size}.available`]: false
                })
            }
        }
    }
}

export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not configured')
            return res.status(500).json({ message: 'Webhook not configured' })
        }

        // req.rawBody is set by the raw body parser in app.js
        const signature = req.headers['x-razorpay-signature']

        if (!signature || !req.rawBody) {
            return res.status(400).json({ message: 'Missing signature or body' })
        }

        // Verify the webhook signature
        const isValid = verifyWebhookSignature(req.rawBody, signature, webhookSecret)

        if (!isValid) {
            console.error('Razorpay webhook signature verification failed')
            return res.status(400).json({ message: 'Invalid signature' })
        }

        const event = req.body

        switch (event.event) {
            case 'payment.captured': {
                const payment = event.payload.payment.entity
                const razorpayOrderId = payment.order_id

                // Find the order by Razorpay order ID (stored in receipt)
                const order = await Order.findOne({
                    _id: payment.notes?.orderId || undefined
                })

                // Fallback: find by receipt field from Razorpay order
                let finalOrder = order
                if (!finalOrder) {
                    // Fetch the Razorpay order to get the receipt (our order ID)
                    try {
                        const razorpay = (await import('razorpay')).default
                        const instance = new razorpay({
                            key_id: process.env.RAZORPAY_KEY_ID,
                            key_secret: process.env.RAZORPAY_KEY_SECRET
                        })
                        const razorpayOrder = await instance.orders.fetch(razorpayOrderId)
                        if (razorpayOrder.receipt) {
                            finalOrder = await Order.findById(razorpayOrder.receipt)
                        }
                    } catch (fetchErr) {
                        console.error('Failed to fetch Razorpay order:', fetchErr.message)
                    }
                }

                if (!finalOrder) {
                    console.error(`Webhook: Order not found for Razorpay order ${razorpayOrderId}`)
                    // Return 200 so Razorpay doesn't retry for an order we can't find
                    return res.status(200).json({ message: 'Order not found, acknowledged' })
                }

                // Idempotency: skip if already marked as paid
                if (finalOrder.payment === true) {
                    return res.status(200).json({ message: 'Already processed' })
                }

                // Mark order as paid
                await Order.findByIdAndUpdate(finalOrder._id, { payment: true })

                // Decrement inventory
                await decrementInventory(finalOrder.items)

                // Clear user cart
                await User.findByIdAndUpdate(finalOrder.userId, { cartData: {} })

                console.log(`Webhook: Order ${finalOrder._id} payment confirmed via webhook`)
                return res.status(200).json({ message: 'Payment confirmed' })
            }

            case 'payment.failed': {
                const payment = event.payload.payment.entity
                const razorpayOrderId = payment.order_id

                console.warn(`Webhook: Payment failed for Razorpay order ${razorpayOrderId}`)

                // Optionally: find and cancel the order
                try {
                    const razorpay = (await import('razorpay')).default
                    const instance = new razorpay({
                        key_id: process.env.RAZORPAY_KEY_ID,
                        key_secret: process.env.RAZORPAY_KEY_SECRET
                    })
                    const razorpayOrder = await instance.orders.fetch(razorpayOrderId)
                    if (razorpayOrder.receipt) {
                        const order = await Order.findById(razorpayOrder.receipt)
                        if (order && !order.payment) {
                            await Order.findByIdAndUpdate(order._id, { status: 'Cancelled' })
                            console.log(`Webhook: Order ${order._id} cancelled due to payment failure`)
                        }
                    }
                } catch (fetchErr) {
                    console.error('Failed to handle payment.failed:', fetchErr.message)
                }

                return res.status(200).json({ message: 'Failure acknowledged' })
            }

            default:
                // Acknowledge unknown events so Razorpay doesn't retry
                return res.status(200).json({ message: `Event ${event.event} not handled` })
        }
    } catch (error) {
        console.error('Razorpay webhook error:', error)
        // Return 200 for unrecoverable errors to prevent infinite retries
        return res.status(200).json({ message: 'Webhook processing error' })
    }
}
