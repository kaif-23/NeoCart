import jwt from 'jsonwebtoken'
import User from '../model/userModel.js'
import { genToken } from '../config/token.js'

// Session timeout configuration
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
const REFRESH_THRESHOLD = 30 * 60 * 1000; // Refresh if less than 30 min remaining

export const sessionTimeout = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next(); // No token, let other middleware handle
        }

        // Decode without verification to check expiry
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return next();
        }

        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = (decoded.exp - now) * 1000;

        // If token expired
        if (timeRemaining <= 0) {
            res.clearCookie('token');
            return res.status(401).json({
                message: "Session expired. Please login again.",
                expired: true
            });
        }

        // Auto-refresh if less than 30 minutes remaining
        if (timeRemaining < REFRESH_THRESHOLD) {
            try {
                // Verify current token is still valid
                jwt.verify(token, process.env.JWT_SECRET);

                // Find user and check if still active
                const user = await User.findOne({
                    _id: decoded.userId,
                    isActive: true
                });

                if (user) {
                    // Issue new token
                    const newToken = await genToken(user._id);
                    res.cookie("token", newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: "strict",
                        maxAge: SESSION_TIMEOUT
                    });

                    // Attach flag for client to know token was refreshed
                    res.set('X-Token-Refreshed', 'true');
                }
            } catch (err) {
                // Token invalid, clear it
                res.clearCookie('token');
            }
        }

        next();
    } catch (error) {
        next(); // Don't block request on error
    }
};

export default sessionTimeout;
