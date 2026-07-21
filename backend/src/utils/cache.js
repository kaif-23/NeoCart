// src/utils/cache.js
// Thin, never-throwing wrapper around Redis for application-level caching.
// All functions swallow Redis errors and return null/false so the app
// gracefully falls back to Mongo if Redis is down (Step 4 safety check #3).
import { getRedisClient } from "../config/redis.js";

/**
 * Get a cached value by key.
 * @returns {any|null} Parsed JSON value, or null on miss/error.
 */
export const cacheGet = async (key) => {
    try {
        const client = await getRedisClient();
        const raw = await client.get(key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.warn(`[cache] GET "${key}" failed (Redis may be down):`, err.message);
        return null;
    }
};

/**
 * Set a cached value with an optional TTL.
 * Fire-and-forget from the caller's perspective — never throws.
 * @param {string}  key
 * @param {any}     value      Will be JSON-serialised.
 * @param {number}  ttlSeconds Default 300s (5 min).
 */
export const cacheSet = async (key, value, ttlSeconds = 300) => {
    try {
        const client = await getRedisClient();
        await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
        console.warn(`[cache] SET "${key}" failed (Redis may be down):`, err.message);
    }
};

/**
 * Delete one or more cache keys.
 * Never throws — a failed invalidation is logged but not fatal.
 * @param {...string} keys
 */
export const cacheDel = async (...keys) => {
    try {
        const client = await getRedisClient();
        if (keys.length > 0) {
            await client.del(keys);
        }
    } catch (err) {
        console.warn(`[cache] DEL "${keys.join(',')}" failed (Redis may be down):`, err.message);
    }
};
