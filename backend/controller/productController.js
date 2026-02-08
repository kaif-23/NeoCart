import { uploadOnCloudinary } from "../config/cloudinary.js"
import Product from "../model/productModel.js"


export const addProduct = async (req, res) => {
    try {
        let { name, description, price, category, subCategory, sizes, bestseller } = req.body

        let image1 = await uploadOnCloudinary(req.files.image1[0].path)
        let image2 = await uploadOnCloudinary(req.files.image2[0].path)
        let image3 = await uploadOnCloudinary(req.files.image3[0].path)
        let image4 = await uploadOnCloudinary(req.files.image4[0].path)

        // Parse sizes array
        const parsedSizes = JSON.parse(sizes)

        // Initialize inventory for each size
        const inventory = {}
        parsedSizes.forEach(size => {
            inventory[size] = {
                stock: 100, // Default stock quantity
                available: true
            }
        })

        let productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: parsedSizes,
            inventory, // Add inventory object
            bestseller: bestseller === "true" ? true : false,
            date: Date.now(),
            image1,
            image2,
            image3,
            image4

        }

        const product = await Product.create(productData)

        return res.status(201).json(product)

    } catch (error) {
        console.log("AddProduct error")
        return res.status(500).json({ message: `AddProduct error ${error}` })
    }

}


export const listProduct = async (req, res) => {

    try {
        const products = await Product.find({}).lean(); // Use lean() for plain objects

        // Convert inventory Map to plain object for each product
        const productsWithConvertedInventory = products.map(product => {
            if (product.inventory && typeof product.inventory === 'object') {
                // Inventory is already an object after lean(), no conversion needed
                return product;
            }
            return product;
        });

        return res.status(200).json(productsWithConvertedInventory)

    } catch (error) {
        console.log("ListProduct error")
        return res.status(500).json({ message: `ListProduct error ${error}` })
    }
}

export const removeProduct = async (req, res) => {
    try {
        let { id } = req.params;
        const product = await Product.findByIdAndDelete(id)
        return res.status(200).json(product)
    } catch (error) {
        console.log("RemoveProduct error")
        return res.status(500).json({ message: `RemoveProduct error ${error}` })
    }

}

// Update inventory for a specific product
export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params
        const { inventory } = req.body // Expected format: { "S": { stock: 50, available: true }, "M": { stock: 30, available: true } }

        const product = await Product.findByIdAndUpdate(
            id,
            { inventory },
            { new: true }
        )

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        return res.status(200).json(product)
    } catch (error) {
        console.log("UpdateInventory error:", error)
        return res.status(500).json({ message: `UpdateInventory error ${error}` })
    }
}

// Initialize inventory for all existing products (migration endpoint)
export const initializeAllInventory = async (req, res) => {
    try {
        const products = await Product.find({})
        let updated = 0
        let alreadyInitialized = 0

        for (const product of products) {
            // Check if inventory needs initialization
            let needsInit = false

            if (!product.inventory) {
                needsInit = true
            } else {
                // Check if inventory is empty or missing sizes
                const inventorySize = product.inventory instanceof Map
                    ? product.inventory.size
                    : Object.keys(product.inventory).length

                if (inventorySize === 0) {
                    needsInit = true
                } else {
                    // Check if all sizes have inventory
                    for (const size of product.sizes) {
                        if (!product.inventory.get(size) && !product.inventory[size]) {
                            needsInit = true
                            break
                        }
                    }
                }
            }

            if (needsInit) {
                console.log(`🔄 Initializing inventory for: ${product.name}`)

                // Initialize inventory for each size using Map methods
                if (!product.inventory) {
                    product.inventory = new Map()
                }

                product.sizes.forEach(size => {
                    product.inventory.set(size, {
                        stock: 100,
                        available: true
                    })
                })

                // Mark as modified for Mongoose to save Map changes
                product.markModified('inventory')

                await product.save()
                updated++
                console.log(`✅ Initialized: ${product.name} - ${product.sizes.join(', ')}`)
            } else {
                alreadyInitialized++
            }
        }

        console.log(`📊 Total: ${products.length}, Updated: ${updated}, Already initialized: ${alreadyInitialized}`)

        return res.status(200).json({
            message: `Inventory initialized for ${updated} products`,
            totalProducts: products.length,
            updated: updated,
            alreadyInitialized: alreadyInitialized
        })
    } catch (error) {
        console.log("InitializeAllInventory error:", error)
        return res.status(500).json({ message: `InitializeAllInventory error ${error}` })
    }
}

// Update existing product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        let { name, description, price, category, subCategory, sizes, bestseller } = req.body

        // Find existing product
        const existingProduct = await Product.findById(id)
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        // Handle image uploads - only update if new images provided
        let image1 = existingProduct.image1
        let image2 = existingProduct.image2
        let image3 = existingProduct.image3
        let image4 = existingProduct.image4

        if (req.files?.image1) {
            image1 = await uploadOnCloudinary(req.files.image1[0].path)
        }
        if (req.files?.image2) {
            image2 = await uploadOnCloudinary(req.files.image2[0].path)
        }
        if (req.files?.image3) {
            image3 = await uploadOnCloudinary(req.files.image3[0].path)
        }
        if (req.files?.image4) {
            image4 = await uploadOnCloudinary(req.files.image4[0].path)
        }

        // Parse sizes array
        const parsedSizes = JSON.parse(sizes)

        // Handle inventory - use provided inventory or create default
        let inventory = {}

        if (req.body.inventory) {
            // Use inventory data from frontend
            inventory = JSON.parse(req.body.inventory)
        } else {
            // Fallback: copy existing inventory for sizes that remain
            for (const size of parsedSizes) {
                if (existingProduct.inventory && existingProduct.inventory.get(size)) {
                    // Keep existing inventory data for this size
                    inventory[size] = existingProduct.inventory.get(size)
                } else {
                    // Initialize new size with default values
                    inventory[size] = {
                        stock: 100,
                        available: true
                    }
                }
            }
        }

        // Update product data
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                description,
                price: Number(price),
                category,
                subCategory,
                sizes: parsedSizes,
                inventory,
                bestseller: bestseller === "true" ? true : false,
                image1,
                image2,
                image3,
                image4
            },
            { new: true }
        )

        console.log(`✅ Product updated: ${updatedProduct.name}`)
        return res.status(200).json(updatedProduct)

    } catch (error) {
        console.log("UpdateProduct error:", error)
        return res.status(500).json({ message: `UpdateProduct error ${error}` })
    }
}

// Add review to product
export const addReview = async (req, res) => {
    try {
        const { productId } = req.params
        const { rating, comment } = req.body
        const userId = req.user._id
        const userName = req.user.name

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: "Comment is required" })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        // Check if user already reviewed this product
        const existingReview = product.reviews.find(
            review => review.userId.toString() === userId.toString()
        )

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product. You can edit your review instead." })
        }

        // Add new review
        product.reviews.push({
            userId,
            userName,
            rating: Number(rating),
            comment: comment.trim(),
            createdAt: new Date()
        })

        // Calculate new average rating
        const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0)
        product.averageRating = (totalRatings / product.reviews.length).toFixed(1)
        product.totalReviews = product.reviews.length

        await product.save()

        return res.status(201).json({
            message: "Review added successfully",
            review: product.reviews[product.reviews.length - 1],
            averageRating: product.averageRating,
            totalReviews: product.totalReviews
        })

    } catch (error) {
        console.log("AddReview error:", error)
        return res.status(500).json({ message: `AddReview error ${error}` })
    }
}

// Get reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params

        const product = await Product.findById(productId).select('reviews averageRating totalReviews')
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        // Sort reviews by newest first
        const sortedReviews = product.reviews.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )

        return res.status(200).json({
            reviews: sortedReviews,
            averageRating: product.averageRating,
            totalReviews: product.totalReviews
        })

    } catch (error) {
        console.log("GetProductReviews error:", error)
        return res.status(500).json({ message: `GetProductReviews error ${error}` })
    }
}

// Update user's own review
export const updateReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params
        const { rating, comment } = req.body
        const userId = req.user._id

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const review = product.reviews.id(reviewId)
        if (!review) {
            return res.status(404).json({ message: "Review not found" })
        }

        // Check if user owns this review
        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only update your own reviews" })
        }

        // Update review
        if (rating) review.rating = Number(rating)
        if (comment) review.comment = comment.trim()

        // Recalculate average rating
        const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0)
        product.averageRating = (totalRatings / product.reviews.length).toFixed(1)

        await product.save()

        return res.status(200).json({
            message: "Review updated successfully",
            review,
            averageRating: product.averageRating
        })

    } catch (error) {
        console.log("UpdateReview error:", error)
        return res.status(500).json({ message: `UpdateReview error ${error}` })
    }
}

// Delete user's own review
export const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params
        const userId = req.user._id

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const review = product.reviews.id(reviewId)
        if (!review) {
            return res.status(404).json({ message: "Review not found" })
        }

        // Check if user owns this review
        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own reviews" })
        }

        // Remove review
        review.deleteOne()

        // Recalculate average rating
        if (product.reviews.length > 0) {
            const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0)
            product.averageRating = (totalRatings / product.reviews.length).toFixed(1)
            product.totalReviews = product.reviews.length
        } else {
            product.averageRating = 0
            product.totalReviews = 0
        }

        await product.save()

        return res.status(200).json({
            message: "Review deleted successfully",
            averageRating: product.averageRating,
            totalReviews: product.totalReviews
        })

    } catch (error) {
        console.log("DeleteReview error:", error)
        return res.status(500).json({ message: `DeleteReview error ${error}` })
    }
}
