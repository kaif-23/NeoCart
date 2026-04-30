import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import { genToken } from '../utils/token.js'
import {
    blacklistToken,
    createTokenId,
    getSession,
    isTokenBlacklisted,
    refreshSession,
    GRACE_PERIOD_SECONDS,
    REFRESH_THRESHOLD_SECONDS,
    SESSION_TTL_SECONDS,
} from '../utils/sessionStore.js'

const SESSION_TIMEOUT_MS = SESSION_TTL_SECONDS * 1000;
const REFRESH_THRESHOLD_MS = REFRESH_THRESHOLD_SECONDS * 1000;

export const sessionTimeout = async (req, res, next) => {
    try {
        const userToken = req.cookies.token;
        const adminToken = req.cookies.adminToken;
        const requestUrl = req.originalUrl || req.url || "";
        const isAdminRoute = requestUrl.startsWith("/api/superadmin") || requestUrl.startsWith("/api/user/getadmin") || requestUrl.startsWith("/api/auth/admin");

        const token = isAdminRoute ? adminToken : (userToken || adminToken);
        const cookieName = isAdminRoute ? 'adminToken' : (userToken ? 'token' : 'adminToken');

        if (!token) {
            return next();
        }

        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return next();
        }

        if (!decoded.sid || !decoded.jti) {
            return next();
        }

        const now = Math.floor(Date.now() / 1000);
        const timeRemaining = (decoded.exp - now) * 1000;

        if (timeRemaining <= 0) {
            res.clearCookie(cookieName);
            return res.status(401).json({
                message: "Session expired. Please login again.",
                expired: true
            });
        }

        const [session, blacklisted] = await Promise.all([
            getSession(decoded.sid),
            isTokenBlacklisted(decoded.jti)
        ])

        if (blacklisted || !session || session.userId !== decoded.userId) {
            res.clearCookie(cookieName);
            return res.status(401).json({
                message: "Session expired. Please login again.",
                expired: true
            });
        }

        if (timeRemaining < REFRESH_THRESHOLD_MS) {
            try {
                jwt.verify(token, process.env.JWT_SECRET);

                const user = await User.findOne({
                    _id: decoded.userId,
                    isActive: true
                });

                if (user) {
                    const newTokenId = createTokenId();
                    const newToken = await genToken(user._id, {
                        sessionId: decoded.sid,
                        jwtId: newTokenId,
                    });

                    req.refreshedTokenId = decoded.jti;
                    await blacklistToken(decoded.jti, Math.max(1, Math.floor(timeRemaining / 1000)));
                    const graceUntil = Date.now() + GRACE_PERIOD_SECONDS * 1000;
                    await refreshSession(decoded.sid, {
                        ip: req.ip,
                        userAgent: req.get('user-agent') || 'unknown',
                        graceJti: decoded.jti,
                        graceUntil,
                    });

                    res.cookie(cookieName, newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
                        maxAge: SESSION_TIMEOUT_MS
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
