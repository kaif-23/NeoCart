import User from "../models/userModel.js"

export const getCurrentUser = async (req, res) => {
    try {
        let user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "user is not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        console.error("getCurrentUser error:", error)
        return res.status(500).json({ message: "Failed to fetch user" })
    }
}

export const getAdmin = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: "Admin not found" })
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            }
        })
    } catch (error) {
        console.error("getAdmin error:", error)
        return res.status(500).json({ message: "Failed to fetch admin" })
    }
}
