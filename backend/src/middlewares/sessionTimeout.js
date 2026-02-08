import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import { genToken } from '../utils/token.js'

// Session timeout configuration
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
const REFRESH_THRESHOLD = 30 * 60 * 1000; // Refresh if less than 30 min remaining

export const sessionTimeout = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.cookies.adminToken;
        const cookieName = req.cookies.adminToken ? 'adminToken' : 'token';

        if (!token) {
            return next();
        }

        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return next();
        }

        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = (decoded.exp - now) * 1000;

        if (timeRemaining <= 0) {
            res.clearCookie('token');
            return res.status(401).json({
                message: "Session expired. Please login again.",
                expired: true
            });
        }

        if (timeRemaining < REFRESH_THRESHOLD) {
            try {
                jwt.verify(token, process.env.JWT_SECRET);

                const user = await User.findOne({
                    _id: decoded.userId,
                    isActive: true
                });

                if (user) {
                    const newToken = await genToken(user._id);
                    res.cookie(cookieName, newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
                        maxAge: SESSION_TIMEOUT
                    });

                    res.set('X-Token-Refreshed', 'true');
                }
            } catch (err) {
                res.clearCookie(cookieName);
            }
        }

        next();
    } catch (error) {
        next();
    }
};

export default sessionTimeout;
