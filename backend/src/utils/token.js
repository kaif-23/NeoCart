import jwt from "jsonwebtoken"
import { SESSION_TTL_SECONDS } from "./sessionStore.js";

const tokenExpiry = `${SESSION_TTL_SECONDS}s`;

export const genToken = async (userId, { sessionId, jwtId } = {}) => {
    try {
        const payload = { userId };
        if (sessionId) {
            payload.sid = sessionId;
        }

        const options = { expiresIn: tokenExpiry };
        if (jwtId) {
            options.jwtid = jwtId;
        }

        let token = await jwt.sign(payload, process.env.JWT_SECRET, options)
        return token
    } catch (error) {
        throw new Error("Token generation failed")
    }
}

export const genToken1 = async (email, { sessionId, jwtId } = {}) => {
    try {
        const payload = { email };
        if (sessionId) {
            payload.sid = sessionId;
        }

        const options = { expiresIn: tokenExpiry };
        if (jwtId) {
            options.jwtid = jwtId;
        }

        let token = await jwt.sign(payload, process.env.JWT_SECRET, options)
        return token
    } catch (error) {
        throw new Error("Token generation failed")
    }
}
