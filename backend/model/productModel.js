import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image1: {
        type: String,
        required: true
    },
    image2: {
        type: String,
        required: true
    },
    image3: {
        type: String,
        required: true
    },
    image4: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    sizes: {
        type: Array,
        required: true
    },
    inventory: {
        type: Map,
        of: {
            stock: { type: Number, default: 0 },
            available: { type: Boolean, default: true }
        },
        default: {}
    },
    date: {
        type: Number,
        required: true
    },
    bestseller: {
        type: Boolean
    }

}, { timestamps: true })

// Database indexes for query performance
productSchema.index({ category: 1, subCategory: 1 }) // For filtering by category
productSchema.index({ bestseller: -1, createdAt: -1 }) // For bestseller sorting
productSchema.index({ date: -1 }) // For newest products
productSchema.index({ name: 'text', description: 'text' }) // Full-text search

const Product = mongoose.model("Product", productSchema)

export default Product