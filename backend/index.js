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
import superadminRoutes from "./routes/superadminRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import sessionTimeout from "./middleware/sessionTimeout.js";

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

const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit to 10 orders per minute
  message: "Too many order requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const cartLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit to 30 cart operations per minute
  message: "Too many cart updates, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter); // Apply to all routes

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(cookieParser());

// Serve static files (images)
app.use('/images', express.static('public'));

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  "http://localhost:5173", // Development frontend
  "http://localhost:5174", // Development admin
  "http://localhost:5175", // Development admin (alternate)
  "http://localhost:5176", // Development frontend (alternate)
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie', 'X-Token-Refreshed'],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Session timeout and auto-refresh middleware
app.use(sessionTimeout);

// Routes with specific rate limiting
app.use("/api/auth", authLimiter, authRoutes); // Strict: 5 req/15min for auth
app.use("/api/user", userRoutes); // General: 100 req/15min
app.use("/api/profile", profileRoutes); // Profile and address management
app.use("/api/product", productRoutes); // General: 100 req/15min
app.use("/api/cart", cartLimiter, cartRoutes); // Cart: 30 req/min
app.use("/api/order", orderLimiter, orderRoutes); // Order: 10 req/min
app.use("/api/superadmin", superadminRoutes); // Superadmin only: user management

// Start Server
app.listen(port, () => {
  console.log("Hello From Server", port);
  connectDb();
});
