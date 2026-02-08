import express from 'express'
import { addProduct, listProduct, removeProduct, updateInventory, initializeAllInventory, updateProduct, addReview, getProductReviews, updateReview, deleteReview } from '../controller/productController.js'
import upload from '../middleware/multer.js'
import adminAuth from "../middleware/adminAuth.js"
import isAuth from '../middleware/isAuth.js'


let productRoutes = express.Router()

// Admin-only routes (protected)
productRoutes.post("/addproduct", adminAuth, upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }]), addProduct)

productRoutes.put("/update/:id", adminAuth, upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }]), updateProduct)

productRoutes.post("/remove/:id", adminAuth, removeProduct)
productRoutes.put("/inventory/:id", adminAuth, updateInventory) // Update inventory for specific product
productRoutes.post("/initialize-inventory", adminAuth, initializeAllInventory) // Initialize inventory for all products

// Public routes (customers can access)
productRoutes.get("/list", listProduct)

// Review routes
productRoutes.post("/review/:productId", isAuth, addReview) // Add review (logged in users only)
productRoutes.get("/review/:productId", getProductReviews) // Get all reviews for a product (public)
productRoutes.put("/review/:productId/:reviewId", isAuth, updateReview) // Update own review
productRoutes.delete("/review/:productId/:reviewId", isAuth, deleteReview) // Delete own review



export default productRoutes