import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import { getSession, isTokenBlacklisted } from "../utils/sessionStore.js";
import { cacheGet, cacheSet } from "../utils/cache.js";

const USER_CACHE_TTL = 300; // 5 minutes

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

        if (!decoded.sid || !decoded.jti) {
            return res.status(401).json({ message: "Session invalid. Please login again." })
        }

        const [session, blacklisted] = await Promise.all([
            getSession(decoded.sid),
            isTokenBlacklisted(decoded.jti)
        ])

        const bypassBlacklist = req.refreshedTokenId && req.refreshedTokenId === decoded.jti;
        const graceActive = session?.graceJti === decoded.jti && session.graceUntil && Date.now() < session.graceUntil;

        if (blacklisted && !bypassBlacklist && !graceActive) {
            return res.status(401).json({ message: "Session revoked. Please login again." })
        }

        if (!session || session.userId !== decoded.userId) {
            return res.status(401).json({ message: "Session expired. Please login again." })
        }

        // --- User cache: consulted only AFTER session + blacklist checks pass ---
        // This ensures a revoked session/blacklisted token is always caught first.
        const userCacheKey = `user:${decoded.userId}`;
        let user = await cacheGet(userCacheKey);

        if (!user) {
            // Cache miss — fetch from Mongo and populate cache.
            user = await User.findOne({
                _id: decoded.userId,
                isActive: true
            }).select('-password').lean()

            if (!user) {
                return res.status(401).json({ message: "User not found or inactive." })
            }

            await cacheSet(userCacheKey, user, USER_CACHE_TTL);
        } else if (!user.isActive) {
            // Cached user was deactivated — explicit check so we don't serve stale inactive state
            // within the TTL window. (Explicit invalidation in superadminController handles this
            // on the write side, but belt-and-suspenders here for correctness.)
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
