import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const superadminAuth = async (req, res, next) => {
    try {
        let token = req.cookies.adminToken

        if (!token) {
            return res.status(401).json({ message: "Not authorized. Please login as superadmin." })
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Session expired. Please login again.", expired: true })
            }
            return res.status(401).json({ message: "Invalid token. Please login again." })
        }

        const user = await User.findOne({
            _id: decoded.userId,
            isActive: true
        }).select('-password')

        if (!user) {
            return res.status(401).json({ message: "User not found or inactive." })
        }

        if (user.role !== 'superadmin') {
            return res.status(403).json({ message: "Access denied. Superadmin privileges required." })
        }

        req.user = user
        req.adminEmail = user.email
        req.adminRole = user.role

        next()

    } catch (error) {
        return res.status(500).json({ message: `Authentication error: ${error.message}` })
    }
}

export default superadminAuth
