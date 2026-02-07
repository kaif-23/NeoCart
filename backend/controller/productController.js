import uploadOnCloudinary from "../config/cloudinary.js"
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
