import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        size: String,
        quantity: Number,
        price: Number,
        image: String
    }],
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    address: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Order Placed',
        enum: ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Razorpay']
    },
    payment: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Number,
        required: true
    }
}, { timestamps: true })

// Add indexes for common queries
orderSchema.index({ userId: 1, createdAt: -1 })
orderSchema.index({ status: 1 })

const Order = mongoose.model('Order', orderSchema)

export default Order