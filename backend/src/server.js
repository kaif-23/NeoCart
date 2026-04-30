import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./config/db.js";
import { getRedisClient } from "./config/redis.js";

dotenv.config();

const port = process.env.PORT || 6000;

// Start Server
app.listen(port, () => {
    console.log("Hello From Server", port);
    connectDb();
    getRedisClient()
        .then(() => console.log("Redis connected"))
        .catch((error) => console.error("Redis connection failed:", error));
});
