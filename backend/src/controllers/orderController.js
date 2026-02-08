import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
dotenv.config()
const currency = 'inr'
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// for User
export const placeOrder = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        const userId = req.userId;

        for (const item of items) {
            const product = await Product.findById(item.productId || item._id)

            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` })
            }

            if (product.inventory && product.inventory[item.size]) {
                const sizeInventory = product.inventory[item.size]

                if (!sizeInventory.available || sizeInventory.stock === 0) {
                    return res.status(400).json({
                        message: `${product.name} (Size ${item.size}) is out of stock`,
                        stockError: true
                    })
                }

                if (item.quantity > sizeInventory.stock) {
                    return res.status(400).json({
                        message: `${product.name} (Size ${item.size}): Only ${sizeInventory.stock} available, you requested ${item.quantity}`,
                        stockError: true
                    })
                }
            }
        }

        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()

        for (const item of items) {
            const product = await Product.findById(item.productId || item._id)

            if (product && product.inventory && product.inventory.get(item.size)) {
                const currentInventory = product.inventory.get(item.size)

                const newStock = Math.max(0, currentInventory.stock - item.quantity)

                product.inventory.set(item.size, {
                    stock: newStock,
                    available: newStock > 0
                })

                product.markModified('inventory')

                await product.save()
                console.log(`✅ Stock updated for ${product.name} (${item.size}): ${currentInventory.stock} → ${newStock}`)
            }
        }

        await User.findByIdAndUpdate(userId, { cartData: {} })

        return res.status(201).json({ message: 'Order Place' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Order Place error' })
    }
}


export const placeOrderRazorpay = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        const userId = req.userId;

        for (const item of items) {
            const product = await Product.findById(item.productId || item._id)

            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` })
            }

            if (product.inventory && product.inventory[item.size]) {
                const sizeInventory = product.inventory[item.size]

                if (!sizeInventory.available || sizeInventory.stock === 0) {
                    return res.status(400).json({
                        message: `${product.name} (Size ${item.size}) is out of stock`,
                        stockError: true
                    })
                }

                if (item.quantity > sizeInventory.stock) {
                    return res.status(400).json({
                        message: `${product.name} (Size ${item.size}): Only ${sizeInventory.stock} available`,
                        stockError: true
                    })
                }
            }
        }

        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod: 'Razorpay',
            payment: false,
            date: Date.now()
        }

        const newOrder = new Order(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }
        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error)
                return res.status(500).json(error)
            }
            res.status(200).json(order)
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error.message
        })
    }
}


export const verifyRazorpay = async (req, res) => {
    try {
        const userId = req.userId
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            const order = await Order.findById(orderInfo.receipt)

            if (order) {
                for (const item of order.items) {
                    const product = await Product.findById(item.productId || item._id)

                    if (product && product.inventory && product.inventory.get(item.size)) {
                        const currentInventory = product.inventory.get(item.size)

                        const newStock = Math.max(0, currentInventory.stock - item.quantity)

                        product.inventory.set(item.size, {
                            stock: newStock,
                            available: newStock > 0
                        })

                        product.markModified('inventory')

                        await product.save()
                        console.log(`✅ Stock updated for ${product.name} (${item.size}): ${currentInventory.stock} → ${newStock}`)
                    }
                }
            }

            await Order.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            await User.findByIdAndUpdate(userId, { cartData: {} })
            res.status(200).json({
                message: 'Payment Successful'
            })
        }
        else {
            res.json({
                message: 'Payment Failed'
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error.message
        })
    }
}


export const userOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ userId })
        return res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "userOrders error" })
    }
}


// for Admin

export const allOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "adminAllOrders error" })
    }
}

export const getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }
        const user = await User.findById(order.userId).select('name email phone profileImage role createdAt')
        res.status(200).json({ order, user: user || null })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'getOrderDetail error' })
    }
}

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body

        await Order.findByIdAndUpdate(orderId, { status })
        return res.status(201).json({ message: 'Status Updated' })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
