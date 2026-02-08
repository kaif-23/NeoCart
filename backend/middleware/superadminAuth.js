import jwt from 'jsonwebtoken'
import User from '../model/userModel.js'

const superadminAuth = async (req, res, next) => {
    try {
        let { token } = req.cookies

        if (!token) {
            return res.status(401).json({ message: "Not authorized. Please login as superadmin." })
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

        // Find user and validate role from database
        const user = await User.findOne({
            _id: decoded.userId,
            isActive: true
        }).select('-password')

        if (!user) {
            return res.status(401).json({ message: "User not found or inactive." })
        }

        // Check if user has SUPERADMIN role ONLY
        if (user.role !== 'superadmin') {
            return res.status(403).json({ message: "Access denied. Superadmin privileges required." })
        }

        // Attach user info to request
        req.user = user
        req.adminEmail = user.email
        req.adminRole = user.role

        next()

    } catch (error) {
        return res.status(500).json({ message: `Authentication error: ${error.message}` })
    }
}

export default superadminAuth
