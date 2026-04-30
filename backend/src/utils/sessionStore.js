import crypto from "crypto";
import { getRedisClient } from "../config/redis.js";

export const SESSION_TTL_SECONDS = 8 * 60 * 60;
export const REFRESH_THRESHOLD_SECONDS = 30 * 60;
export const GRACE_PERIOD_SECONDS = 30;

const sessionKey = (sessionId) => `sess:${sessionId}`;
const blacklistKey = (tokenId) => `bl:${tokenId}`;

const safeParseJson = (value) => {
    try {
        return JSON.parse(value);
    } catch (error) {
        return null;
    }
};

export const createSessionId = () => crypto.randomBytes(16).toString("hex");
export const createTokenId = () => crypto.randomBytes(16).toString("hex");

export const saveSession = async (sessionId, data, ttlSeconds = SESSION_TTL_SECONDS) => {
    if (!sessionId) {
        throw new Error("Session ID is required");
    }
    const client = await getRedisClient();
    const payload = {
        ...data,
        lastSeen: new Date().toISOString(),
    };

    await client.set(sessionKey(sessionId), JSON.stringify(payload), {
        EX: ttlSeconds,
    });

    return payload;
};

export const getSession = async (sessionId) => {
    if (!sessionId) {
        return null;
    }
    const client = await getRedisClient();
    const raw = await client.get(sessionKey(sessionId));
    if (!raw) {
        return null;
    }
    return safeParseJson(raw);
};

export const refreshSession = async (sessionId, updates = {}, ttlSeconds = SESSION_TTL_SECONDS) => {
    if (!sessionId) {
        return null;
    }
    const existing = await getSession(sessionId);
    if (!existing) {
        return null;
    }

    const updated = {
        ...existing,
        ...updates,
        lastSeen: new Date().toISOString(),
    };

    const client = await getRedisClient();
    await client.set(sessionKey(sessionId), JSON.stringify(updated), {
        EX: ttlSeconds,
    });

    return updated;
};

export const deleteSession = async (sessionId) => {
    if (!sessionId) {
        return;
    }
    const client = await getRedisClient();
    await client.del(sessionKey(sessionId));
};

export const blacklistToken = async (tokenId, ttlSeconds) => {
    if (!tokenId || ttlSeconds <= 0) {
        return;
    }

    const client = await getRedisClient();
    await client.set(blacklistKey(tokenId), "1", {
        EX: ttlSeconds,
    });
};

export const isTokenBlacklisted = async (tokenId) => {
    if (!tokenId) {
        return false;
    }

    const client = await getRedisClient();
    const exists = await client.exists(blacklistKey(tokenId));
    return exists === 1;
};
