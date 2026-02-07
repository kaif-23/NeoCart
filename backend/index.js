import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const port = process.env.PORT || 6000;
const app = express();

// Trust proxy only when behind reverse proxy (Render, Heroku, Nginx, etc.)
// Uncomment when deploying to production with load balancer
// app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to load
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/images'), // Don't rate limit static images
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const productReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for read-only operations
  message: "Too many product requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter); // Apply to all routes

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(cookieParser());

// Serve static files (images)
app.use('/images', express.static('public'));

app.use(
  cors({
    origin: [
      "https://neocart-frontend.onrender.com",
      "https://neocart-admin.onrender.com",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

// Routes with specific rate limiting
app.use("/api/auth", authLimiter, authRoutes); // Strict: 5 req/15min for auth
app.use("/api/user", userRoutes); // General: 100 req/15min
app.use("/api/product", productRoutes); // General: 100 req/15min (consider productReadLimiter for GET routes)
app.use("/api/cart", cartRoutes); // General: 100 req/15min
app.use("/api/order", orderRoutes); // General: 100 req/15min

// Start Server
app.listen(port, () => {
  console.log("Hello From Server", port);
  connectDb();
});
