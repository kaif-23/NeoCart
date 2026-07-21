import User from "../models/userModel.js";
import { calculateOrderAmount } from "./orderController.js";

export const addToCart = async (req, res) => {
    try {
        const { itemId, size } = req.body;
        // req.user is attached by isAuth and includes cartData (select('-password') keeps all other fields).
        // No need to re-fetch from DB for the read.
        const userData = req.user;

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        // Mutation: must still write to Mongo.
        await User.findByIdAndUpdate(req.userId, { cartData });

        return res.status(201).json({ message: "Added to cart" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "addToCart error" });
    }
}

export const UpdateCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body
        // req.user is attached by isAuth — no redundant DB fetch needed for the read.
        const userData = req.user;

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        let cartData = userData.cartData;
        cartData[itemId][size] = quantity

        // Mutation: must still write to Mongo.
        await User.findByIdAndUpdate(req.userId, { cartData })

        return res.status(201).json({ message: "cart updated" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "updateCart error" })
    }
}

export const getUserCart = async (req, res) => {
    try {
        // req.user is attached by isAuth and includes cartData — no DB fetch needed.
        const userData = req.user;

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = userData.cartData;

        return res.status(200).json(cartData)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "getUserCart error" })
    }
}

export const getCartTotals = async (req, res) => {
    try {
        // Support both authenticated users (from req.user) and guests (from req.body.cartData)
        let cartData = req.body.cartData;
        
        if (!cartData && req.user) {
            cartData = req.user.cartData;
        }

        cartData = cartData || {};
        const items = [];

        for (const itemId in cartData) {
            for (const size in cartData[itemId]) {
                const quantity = cartData[itemId][size];
                if (quantity > 0) {
                    items.push({ productId: itemId, size, quantity });
                }
            }
        }

        if (items.length === 0) {
            return res.status(200).json({ subTotal: 0, grandTotal: 0, amount: 0, lineItems: [] });
        }

        const totals = await calculateOrderAmount(items);
        return res.status(200).json(totals);

    } catch (error) {
        console.log("getCartTotals error:", error);
        return res.status(500).json({ message: error.message || "Failed to calculate cart totals" });
    }
}
