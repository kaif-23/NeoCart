import { uploadOnCloudinary } from "../config/cloudinary.js"
import Product from "../models/productModel.js"
import { cacheGet, cacheSet, cacheDel } from "../utils/cache.js"

const PRODUCTS_CACHE_KEY = "products:list";
const PRODUCTS_CACHE_TTL  = 300; // 5 minutes


export const addProduct = async (req, res) => {
    try {
        let { name, description, price, category, subCategory, sizes, bestseller } = req.body

        let image1 = await uploadOnCloudinary(req.files.image1[0].path)
        let image2 = await uploadOnCloudinary(req.files.image2[0].path)
        let image3 = await uploadOnCloudinary(req.files.image3[0].path)
        let image4 = await uploadOnCloudinary(req.files.image4[0].path)

        const parsedSizes = JSON.parse(sizes)

        const inventory = {}
        parsedSizes.forEach(size => {
            inventory[size] = {
                stock: 100,
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
            inventory,
            bestseller: bestseller === "true" ? true : false,
            date: Date.now(),
            image1,
            image2,
            image3,
            image4
        }

        const product = await Product.create(productData)

        // Invalidate cached list so the next read picks up the new product.
        await cacheDel(PRODUCTS_CACHE_KEY);

        return res.status(201).json(product)

    } catch (error) {
        console.log("AddProduct error")
        return res.status(500).json({ message: "Failed to add product" })
    }
}


export const listProduct = async (req, res) => {
    try {
        // --- Cache check ---
        // --- Filter and Sort Helper ---
        const filterAndSort = (productsList, query) => {
            let filtered = [...productsList];
            
            if (query.category) {
                const categories = query.category.split(',');
                filtered = filtered.filter(p => categories.includes(p.category));
            }
            if (query.subCategory) {
                const subCategories = query.subCategory.split(',');
                filtered = filtered.filter(p => subCategories.includes(p.subCategory));
            }
            
            if (query.sort) {
                if (query.sort === 'low-high') filtered.sort((a,b) => a.price - b.price);
                if (query.sort === 'high-low') filtered.sort((a,b) => b.price - a.price);
            }
            
            return filtered;
        };

        const cached = await cacheGet(PRODUCTS_CACHE_KEY);
        if (cached) {
            const processedList = filterAndSort(cached, req.query);
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit) || 20;

            if (page && page > 0) {
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const paginatedProducts = processedList.slice(startIndex, endIndex);
                return res.status(200).json({
                    products: paginatedProducts,
                    totalPages: Math.ceil(processedList.length / limit),
                    currentPage: page,
                    totalProducts: processedList.length
                });
            }
            return res.status(200).json(processedList);
        }

        // --- Cache miss: query Mongo and populate cache ---
        const products = await Product.find({}).lean();

        const productsWithConvertedInventory = products.map(product => {
            if (product.inventory && typeof product.inventory === 'object') {
                return product;
            }
            return product;
        });

        await cacheSet(PRODUCTS_CACHE_KEY, productsWithConvertedInventory, PRODUCTS_CACHE_TTL);

        // --- Pagination Logic (In-Memory from Cache) ---
        const processedList = filterAndSort(productsWithConvertedInventory, req.query);
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) || 20;

        if (page && page > 0) {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedProducts = processedList.slice(startIndex, endIndex);
            return res.status(200).json({
                products: paginatedProducts,
                totalPages: Math.ceil(processedList.length / limit),
                currentPage: page,
                totalProducts: processedList.length
            });
        }

        // Return full list if no pagination requested (backward compatibility)
        return res.status(200).json(processedList);

    } catch (error) {
        console.log("ListProduct error:", error);
        return res.status(500).json({ message: "Failed to list products" });
    }
}

// --- New Endpoints for Frontend Refactor ---

// Helper function to get the full product list (cached or Mongo)
const getFullProductList = async () => {
    const cached = await cacheGet(PRODUCTS_CACHE_KEY);
    if (cached) return cached;

    const products = await Product.find({}).lean();
    const productsWithConvertedInventory = products.map(product => {
        if (product.inventory && typeof product.inventory === 'object') {
            return product;
        }
        return product;
    });

    await cacheSet(PRODUCTS_CACHE_KEY, productsWithConvertedInventory, PRODUCTS_CACHE_TTL);
    return productsWithConvertedInventory;
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await getFullProductList();
        const product = products.find(p => p._id.toString() === id);
        
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json(product);
    } catch (error) {
        console.log("GetProductById error:", error);
        return res.status(500).json({ message: "Failed to get product" });
    }
};

export const getBestSellers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const products = await getFullProductList();
        const bestSellers = products.filter(p => p.bestseller === true).slice(0, limit);
        return res.status(200).json(bestSellers);
    } catch (error) {
        console.log("GetBestSellers error:", error);
        return res.status(500).json({ message: "Failed to get best sellers" });
    }
};

export const getLatestProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const products = await getFullProductList();
        // Sort by date descending
        const sortedProducts = [...products].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        const latest = sortedProducts.slice(0, limit);
        return res.status(200).json(latest);
    } catch (error) {
        console.log("GetLatestProducts error:", error);
        return res.status(500).json({ message: "Failed to get latest products" });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const query = (req.query.q || '').trim().toLowerCase();
        if (!query || query.length < 2) {
            return res.status(200).json([]);
        }

        const products = await getFullProductList();
        const filtered = products.filter(product =>
            (product.name && product.name.toLowerCase().includes(query)) ||
            (product.category && product.category.toLowerCase().includes(query)) ||
            (product.subCategory && product.subCategory.toLowerCase().includes(query))
        );
        
        // Limit search results to avoid massive payloads
        const limit = parseInt(req.query.limit) || 8;
        return res.status(200).json(filtered.slice(0, limit));
    } catch (error) {
        console.log("SearchProducts error:", error);
        return res.status(500).json({ message: "Failed to search products" });
    }
};

export const removeProduct = async (req, res) => {
    try {
        let { id } = req.params;
        const product = await Product.findByIdAndDelete(id)
        await cacheDel(PRODUCTS_CACHE_KEY);
        return res.status(200).json(product)
    } catch (error) {
        console.log("RemoveProduct error")
        return res.status(500).json({ message: "Failed to remove product" })
    }
}

export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params
        const { inventory } = req.body

        const product = await Product.findByIdAndUpdate(
            id,
            { inventory },
            { new: true }
        )

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        await cacheDel(PRODUCTS_CACHE_KEY);
        return res.status(200).json(product)
    } catch (error) {
        console.log("UpdateInventory error:", error)
        return res.status(500).json({ message: "Failed to update inventory" })
    }
}

export const initializeAllInventory = async (req, res) => {
    try {
        const products = await Product.find({})
        let updated = 0
        let alreadyInitialized = 0

        for (const product of products) {
            let needsInit = false

            if (!product.inventory) {
                needsInit = true
            } else {
                const inventorySize = product.inventory instanceof Map
                    ? product.inventory.size
                    : Object.keys(product.inventory).length

                if (inventorySize === 0) {
                    needsInit = true
                } else {
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

                if (!product.inventory) {
                    product.inventory = new Map()
                }

                product.sizes.forEach(size => {
                    product.inventory.set(size, {
                        stock: 100,
                        available: true
                    })
                })

                product.markModified('inventory')

                await product.save()
                updated++
                console.log(`✅ Initialized: ${product.name} - ${product.sizes.join(', ')}`)
            } else {
                alreadyInitialized++
            }
        }

        console.log(`📊 Total: ${products.length}, Updated: ${updated}, Already initialized: ${alreadyInitialized}`)

        await cacheDel(PRODUCTS_CACHE_KEY);

        return res.status(200).json({
            message: `Inventory initialized for ${updated} products`,
            totalProducts: products.length,
            updated: updated,
            alreadyInitialized: alreadyInitialized
        })
    } catch (error) {
        console.log("InitializeAllInventory error:", error)
        return res.status(500).json({ message: "Failed to initialize inventory" })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        let { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const existingProduct = await Product.findById(id)
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

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

        const parsedSizes = JSON.parse(sizes)

        let inventory = {}

        if (req.body.inventory) {
            inventory = JSON.parse(req.body.inventory)
        } else {
            for (const size of parsedSizes) {
                if (existingProduct.inventory && existingProduct.inventory.get(size)) {
                    inventory[size] = existingProduct.inventory.get(size)
                } else {
                    inventory[size] = {
                        stock: 100,
                        available: true
                    }
                }
            }
        }

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

        await cacheDel(PRODUCTS_CACHE_KEY);
        console.log(`✅ Product updated: ${updatedProduct.name}`)
        return res.status(200).json(updatedProduct)

    } catch (error) {
        console.log("UpdateProduct error:", error)
        return res.status(500).json({ message: "Failed to update product" })
    }
}

export const addReview = async (req, res) => {
    try {
        const { productId } = req.params
        const { rating, comment } = req.body
        const userId = req.user._id
        const userName = req.user.name

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

        const existingReview = product.reviews.find(
            review => review.userId.toString() === userId.toString()
        )

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product. You can edit your review instead." })
        }

        product.reviews.push({
            userId,
            userName,
            rating: Number(rating),
            comment: comment.trim(),
            createdAt: new Date()
        })

        const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0)
        product.averageRating = (totalRatings / product.reviews.length).toFixed(1)
        product.totalReviews = product.reviews.length

        await product.save()
        await cacheDel(PRODUCTS_CACHE_KEY);

        return res.status(201).json({
            message: "Review added successfully",
            review: product.reviews[product.reviews.length - 1],
            averageRating: product.averageRating,
            totalReviews: product.totalReviews
        })

    } catch (error) {
        console.log("AddReview error:", error)
        return res.status(500).json({ message: "Failed to add review" })
    }
}

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params

        const product = await Product.findById(productId).select('reviews averageRating totalReviews')
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

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
        return res.status(500).json({ message: "Failed to fetch reviews" })
    }
}

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

        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only update your own reviews" })
        }

        if (rating) review.rating = Number(rating)
        if (comment) review.comment = comment.trim()

        const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0)
        product.averageRating = (totalRatings / product.reviews.length).toFixed(1)

        await product.save()
        await cacheDel(PRODUCTS_CACHE_KEY);

        return res.status(200).json({
            message: "Review updated successfully",
            review,
            averageRating: product.averageRating
        })

    } catch (error) {
        console.log("UpdateReview error:", error)
        return res.status(500).json({ message: "Failed to update review" })
    }
}

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

        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own reviews" })
        }

        review.deleteOne()

        if (product.reviews.length > 0) {
            const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0)
            product.averageRating = (totalRatings / product.reviews.length).toFixed(1)
            product.totalReviews = product.reviews.length
        } else {
            product.averageRating = 0
            product.totalReviews = 0
        }

        await product.save()
        await cacheDel(PRODUCTS_CACHE_KEY);

        return res.status(200).json({
            message: "Review deleted successfully",
            averageRating: product.averageRating,
            totalReviews: product.totalReviews
        })

    } catch (error) {
        console.log("DeleteReview error:", error)
        return res.status(500).json({ message: "Failed to delete review" })
    }
}
