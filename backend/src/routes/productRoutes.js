import express from 'express'
import { addProduct, listProduct, removeProduct, updateInventory, initializeAllInventory, updateProduct, addReview, getProductReviews, updateReview, deleteReview } from '../controllers/productController.js'
import upload from '../middlewares/multer.js'
import adminAuth from "../middlewares/adminAuth.js"
import isAuth from '../middlewares/isAuth.js'

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
productRoutes.put("/inventory/:id", adminAuth, updateInventory)
productRoutes.post("/initialize-inventory", adminAuth, initializeAllInventory)

// Public routes
productRoutes.get("/list", listProduct)

// Review routes
productRoutes.post("/review/:productId", isAuth, addReview)
productRoutes.get("/review/:productId", getProductReviews)
productRoutes.put("/review/:productId/:reviewId", isAuth, updateReview)
productRoutes.delete("/review/:productId/:reviewId", isAuth, deleteReview)

export default productRoutes
