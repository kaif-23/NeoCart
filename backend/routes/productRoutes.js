import express from 'express'
import { addProduct, listProduct, removeProduct, updateInventory, initializeAllInventory, updateProduct } from '../controller/productController.js'
import upload from '../middleware/multer.js'
import adminAuth from "../middleware/adminAuth.js"


let productRoutes = express.Router()

productRoutes.post("/addproduct", upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }]), addProduct)

productRoutes.put("/update/:id", adminAuth, upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }]), updateProduct)

productRoutes.get("/list", listProduct)
productRoutes.post("/remove/:id", adminAuth, removeProduct)
productRoutes.put("/inventory/:id", adminAuth, updateInventory) // Update inventory for specific product
productRoutes.post("/initialize-inventory", adminAuth, initializeAllInventory) // Initialize inventory for all products



export default productRoutes