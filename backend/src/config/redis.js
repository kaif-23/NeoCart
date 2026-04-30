import { createClient } from "redis";

let redisClient = null;
let redisConnectPromise = null;

export const getRedisClient = async () => {
    if (!redisClient) {
        const redisUrl = process.env.REDIS_URL || (process.env.NODE_ENV !== "production" ? "redis://localhost:6379" : null);
        if (!redisUrl) {
            throw new Error("REDIS_URL is required in production.");
        }
        if (!process.env.REDIS_URL) {
            console.warn("REDIS_URL is not set. Using default redis://localhost:6379 for development.");
        }

        redisClient = createClient({
            url: redisUrl,
        });

        redisClient.on("error", (error) => {
            console.error("Redis client error:", error);
        });
    }

    if (!redisClient.isOpen) {
        if (!redisConnectPromise) {
            redisConnectPromise = redisClient.connect().finally(() => {
                redisConnectPromise = null;
            });
        }
        await redisConnectPromise;
    }

    return redisClient;
};
