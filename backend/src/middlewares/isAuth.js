import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const isAuth = async (req, res, next) => {
    try {
        let { token } = req.cookies

        if (!token) {
            return res.status(401).json({ message: "Not authorized. Please login." })
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Session expired. Please login again.", expired: true })
            }
            return res.status(401).json({ message: "Invalid token. Please login again." })
        }

        // Find user and check if active
        const user = await User.findOne({
            _id: decoded.userId,
            isActive: true
        }).select('-password')

        if (!user) {
            return res.status(401).json({ message: "User not found or inactive." })
        }

        // Attach user info to request
        req.user = user
        req.userId = user._id

        next()

    } catch (error) {
        return res.status(500).json({ message: `Authentication error: ${error.message}` })
    }
}

export default isAuth
